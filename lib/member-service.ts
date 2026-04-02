import { DEFAULT_AVATAR, MOCK_STRAVA_PROFILE, seedMembers } from "@/lib/mock-data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";
import {
  forgetStravaConnection,
  rememberStravaConnection,
} from "@/lib/store";
import type {
  Gender,
  Member,
  PasswordResetPayload,
  PhotoSource,
  RegisterPayload,
  SessionMember,
  StravaProfile,
  UpdateProfilePayload,
} from "@/lib/types";

type MemberProfileRow = Database["public"]["Tables"]["member_profiles"]["Row"];
type LeagueMemberRow = Database["public"]["Functions"]["list_member_profiles_for_league"]["Returns"][number];

const SESSION_MEMBER_COLUMNS =
  "user_id,email,first_name,last_name,full_name,member_number,gender,city,upload_photo,strava_photo,photo_source,strava_connected,strava_athlete_id,year_km,year_elevation,is_admin";

const RESERVED_MEMBER_NUMBERS = new Set(seedMembers.map((member) => member.memberNumber));

function normalizeText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function normalizeEmail(value: string | null | undefined): string {
  return normalizeText(value).toLowerCase();
}

function normalizeMemberNumber(value: string | null | undefined): string {
  return normalizeText(value).toUpperCase();
}

function normalizeGender(value: string | null | undefined): Gender {
  return value === "women" ? "women" : "men";
}

function normalizePhotoSource(value: string | null | undefined): PhotoSource {
  return value === "strava" ? "strava" : "upload";
}

function ensureValidEmail(email: string): void {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Debes indicar un email valido.");
  }
}

function ensureValidMemberNumber(memberNumber: string): void {
  if (!/^L-\d{3}$/.test(memberNumber)) {
    throw new Error("El numero de socio debe tener formato L-000.");
  }

  if (memberNumber === "L-000") {
    throw new Error("L-000 queda reservado para administracion.");
  }
}

function ensureAvailableMemberNumber(memberNumber: string, currentMemberNumber?: string): void {
  if (memberNumber !== currentMemberNumber && RESERVED_MEMBER_NUMBERS.has(memberNumber)) {
    throw new Error("Ese numero de socio ya esta reservado en la liga demo.");
  }
}

function ensureValidPassword(password: string): void {
  if (password.length < 6) {
    throw new Error("La contrasena debe tener al menos 6 caracteres.");
  }
}

function normalizeStravaProfile(profile: StravaProfile | null | undefined): StravaProfile | null {
  if (!profile) {
    return null;
  }

  return {
    id: Number(profile.id) || MOCK_STRAVA_PROFILE.id,
    firstname: normalizeText(profile.firstname) || MOCK_STRAVA_PROFILE.firstname,
    lastname: normalizeText(profile.lastname) || MOCK_STRAVA_PROFILE.lastname,
    city: normalizeText(profile.city),
    profile: normalizeText(profile.profile),
    profileMedium: normalizeText(profile.profileMedium) || normalizeText(profile.profile),
    ytdKm: Number.isFinite(Number(profile.ytdKm)) ? Number(profile.ytdKm) : 0,
    ytdElevation: Number.isFinite(Number(profile.ytdElevation)) ? Number(profile.ytdElevation) : 0,
  };
}

function toJsonProfile(profile: StravaProfile | null): Json | undefined {
  if (!profile) {
    return undefined;
  }

  return {
    id: profile.id,
    firstname: profile.firstname,
    lastname: profile.lastname,
    city: profile.city,
    profile: profile.profile,
    profileMedium: profile.profileMedium,
    ytdKm: profile.ytdKm,
    ytdElevation: profile.ytdElevation,
  };
}

function mapMemberRow(row: LeagueMemberRow): Member {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name || `${row.first_name} ${row.last_name}`.trim(),
    memberNumber: row.member_number,
    gender: normalizeGender(row.gender),
    city: row.city,
    uploadPhoto: row.upload_photo || DEFAULT_AVATAR,
    stravaPhoto: row.strava_photo || DEFAULT_AVATAR,
    photoSource: normalizePhotoSource(row.photo_source),
    stravaConnected: row.strava_connected,
    stravaAthleteId: row.strava_athlete_id ?? null,
    yearKm: Number(row.year_km || 0),
    yearElevation: Number(row.year_elevation || 0),
    isAdmin: row.is_admin,
  };
}

function mapSessionMemberRow(row: MemberProfileRow): SessionMember {
  return {
    id: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name || `${row.first_name} ${row.last_name}`.trim(),
    memberNumber: row.member_number,
    gender: normalizeGender(row.gender),
    city: row.city,
    uploadPhoto: row.upload_photo || DEFAULT_AVATAR,
    stravaPhoto: row.strava_photo || DEFAULT_AVATAR,
    photoSource: normalizePhotoSource(row.photo_source),
    stravaConnected: row.strava_connected,
    stravaAthleteId: row.strava_athlete_id ?? null,
    yearKm: Number(row.year_km || 0),
    yearElevation: Number(row.year_elevation || 0),
    isAdmin: row.is_admin,
  };
}

function mapSupabaseError(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : fallback;

  if (
    message.includes("Invalid login credentials") ||
    message.includes("invalid login credentials")
  ) {
    return new Error("No encontramos un socio con ese email y contrasena.");
  }

  if (
    message.includes("User already registered") ||
    message.includes("already registered") ||
    message.includes("duplicate key value")
  ) {
    return new Error("Ese email ya esta registrado.");
  }

  if (message.includes("Email not confirmed")) {
    return new Error("Tu email aun no esta confirmado.");
  }

  return new Error(message || fallback);
}

function isSupabaseSessionMissingError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AuthSessionMissingError" || error.message.includes("Auth session missing"))
  );
}

async function fetchCurrentProfileWithClient(): Promise<SessionMember | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (isSupabaseSessionMissingError(userError)) {
      return null;
    }

    throw mapSupabaseError(userError, "No hemos podido validar la sesion actual.");
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("member_profiles")
    .select(SESSION_MEMBER_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw mapSupabaseError(error, "No hemos podido cargar tu perfil.");
  }

  return data ? mapSessionMemberRow(data as MemberProfileRow) : null;
}

export async function getCurrentSessionMember(): Promise<SessionMember | null> {
  return fetchCurrentProfileWithClient();
}

export async function listLeagueMembers(): Promise<Member[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("list_member_profiles_for_league");

  if (error) {
    throw mapSupabaseError(error, "No hemos podido cargar la clasificacion de socios.");
  }

  const persistedMembers = (data ?? []).map(mapMemberRow);
  const persistedMemberNumbers = new Set(
    persistedMembers.map((member) => member.memberNumber),
  );

  return [
    ...persistedMembers,
    ...seedMembers.filter((member) => !persistedMemberNumbers.has(member.memberNumber)),
  ];
}

export async function registerMember(payload: RegisterPayload): Promise<SessionMember> {
  const firstName = normalizeText(payload.firstName);
  const lastName = normalizeText(payload.lastName);
  const email = normalizeEmail(payload.email);
  const password = payload.password ?? "";
  const memberNumber = normalizeMemberNumber(payload.memberNumber);
  const gender = normalizeGender(payload.gender);
  const city = normalizeText(payload.city);
  const uploadPhoto = payload.uploadPhoto || "";
  const draftStravaProfile = normalizeStravaProfile(payload.draftStravaProfile);

  if (!firstName || !lastName) {
    throw new Error("Debes indicar nombre y apellidos.");
  }

  ensureValidEmail(email);
  ensureValidPassword(password);
  ensureValidMemberNumber(memberNumber);
  ensureAvailableMemberNumber(memberNumber);

  const admin = getSupabaseAdminClient();
  const supabase = await createServerSupabaseClient();

  const { data: createdUserData, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      member_number: memberNumber,
    },
  });

  if (createUserError || !createdUserData.user) {
    throw mapSupabaseError(createUserError, "No se pudo crear la cuenta de socio.");
  }

  try {
    const { error: profileError } = await admin.rpc("create_member_profile", {
      p_user_id: createdUserData.user.id,
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_member_number: memberNumber,
      p_gender: gender,
      p_city: city,
      p_upload_photo: uploadPhoto,
      p_use_strava_photo: Boolean(payload.useStravaPhoto),
      p_draft_strava_profile: toJsonProfile(draftStravaProfile),
    });

    if (profileError) {
      throw profileError;
    }
  } catch (error) {
    await admin.auth.admin.deleteUser(createdUserData.user.id);
    throw mapSupabaseError(error, "No se pudo guardar el perfil del socio.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw mapSupabaseError(
      signInError,
      "La cuenta se ha creado, pero no hemos podido abrir la sesion.",
    );
  }

  const member = await fetchCurrentProfileWithClient();
  if (!member) {
    throw new Error("La cuenta se ha creado, pero tu perfil aun no esta disponible.");
  }

  if (draftStravaProfile) {
    rememberStravaConnection(
      member.id,
      draftStravaProfile,
      "mock-token",
      Date.now() + 1000 * 60 * 60,
    );
  }

  return member;
}

export async function loginMember(emailInput: string, password: string): Promise<SessionMember> {
  const email = normalizeEmail(emailInput);
  ensureValidEmail(email);
  ensureValidPassword(password);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw mapSupabaseError(error, "No se pudo iniciar sesion.");
  }

  const member = await fetchCurrentProfileWithClient();
  if (!member) {
    await supabase.auth.signOut();
    throw new Error("La cuenta existe, pero todavia no tiene perfil de socio asociado.");
  }

  return member;
}

export async function logoutMember(): Promise<void> {
  const member = await fetchCurrentProfileWithClient();
  if (member) {
    forgetStravaConnection(member.id);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw mapSupabaseError(error, "No se pudo cerrar la sesion.");
  }
}

export async function updateCurrentMemberProfile(
  payload: UpdateProfilePayload,
): Promise<SessionMember> {
  const currentMember = await fetchCurrentProfileWithClient();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  const firstName = normalizeText(payload.firstName);
  const lastName = normalizeText(payload.lastName);
  const email = normalizeEmail(payload.email);
  const memberNumber = normalizeMemberNumber(payload.memberNumber);
  const gender = normalizeGender(payload.gender);
  const city = normalizeText(payload.city);

  if (!firstName || !lastName) {
    throw new Error("Debes indicar nombre y apellidos.");
  }

  ensureValidEmail(email);
  ensureValidMemberNumber(memberNumber);
  ensureAvailableMemberNumber(memberNumber, currentMember.memberNumber);

  const admin = getSupabaseAdminClient();
  const supabase = await createServerSupabaseClient();
  const emailHasChanged = email !== currentMember.email;

  try {
    if (emailHasChanged) {
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(
        currentMember.id,
        {
          email,
          email_confirm: true,
        },
      );

      if (authUpdateError) {
        throw authUpdateError;
      }
    }

    const { error } = await supabase.rpc("update_current_member_profile", {
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_member_number: memberNumber,
      p_gender: gender,
      p_city: city,
      p_upload_photo: payload.uploadPhoto ?? undefined,
      p_use_strava_photo: Boolean(payload.useStravaPhoto),
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    if (emailHasChanged) {
      await admin.auth.admin.updateUserById(currentMember.id, {
        email: currentMember.email,
        email_confirm: true,
      });
    }

    throw mapSupabaseError(error, "No se pudo actualizar el perfil.");
  }

  const updatedMember = await fetchCurrentProfileWithClient();
  if (!updatedMember) {
    throw new Error("No hemos podido cargar tu perfil actualizado.");
  }

  return updatedMember;
}

export async function resetMemberPassword(payload: PasswordResetPayload): Promise<void> {
  const email = normalizeEmail(payload.email);
  const memberNumber = normalizeMemberNumber(payload.memberNumber);
  const newPassword = payload.newPassword ?? "";

  ensureValidEmail(email);
  ensureValidMemberNumber(memberNumber);
  ensureValidPassword(newPassword);

  const admin = getSupabaseAdminClient();
  const {
    data: memberId,
    error: lookupError,
  } = await admin.rpc("find_member_profile_for_password_reset", {
    p_email: email,
    p_member_number: memberNumber,
  });

  if (lookupError || !memberId) {
    throw mapSupabaseError(
      lookupError,
      "No hemos encontrado un socio con ese email y numero.",
    );
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(memberId, {
    password: newPassword,
  });

  if (updateError) {
    throw mapSupabaseError(updateError, "No se pudo actualizar la contrasena.");
  }
}

export async function connectMockStrava(): Promise<SessionMember> {
  const currentMember = await fetchCurrentProfileWithClient();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  const profile: StravaProfile = {
    ...MOCK_STRAVA_PROFILE,
    id: currentMember.stravaAthleteId ?? MOCK_STRAVA_PROFILE.id,
    firstname: currentMember.firstName || MOCK_STRAVA_PROFILE.firstname,
    lastname: currentMember.lastName || MOCK_STRAVA_PROFILE.lastname,
    city: currentMember.city || MOCK_STRAVA_PROFILE.city,
  };

  return setCurrentMemberStrava(profile, "mock-token", Date.now() + 1000 * 60 * 60, true);
}

export async function setCurrentMemberStrava(
  profile: StravaProfile,
  accessToken: string,
  expiresAt: number,
  useStravaPhoto = true,
): Promise<SessionMember> {
  const currentMember = await fetchCurrentProfileWithClient();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  const supabase = await createServerSupabaseClient();
  const normalizedProfile = normalizeStravaProfile(profile);

  if (!normalizedProfile) {
    throw new Error("No hemos podido interpretar el perfil de Strava.");
  }

  const { error } = await supabase.rpc("set_current_member_strava", {
    p_profile: toJsonProfile(normalizedProfile) as Json,
    p_use_strava_photo: useStravaPhoto,
  });

  if (error) {
    throw mapSupabaseError(error, "No se pudo conectar Strava.");
  }

  rememberStravaConnection(currentMember.id, normalizedProfile, accessToken, expiresAt);

  const updatedMember = await fetchCurrentProfileWithClient();
  if (!updatedMember) {
    throw new Error("No hemos podido recargar tu perfil tras conectar Strava.");
  }

  return updatedMember;
}

export async function disconnectCurrentMemberStrava(): Promise<SessionMember> {
  const currentMember = await fetchCurrentProfileWithClient();
  if (!currentMember) {
    throw new Error("Necesitas iniciar sesion para continuar.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("clear_current_member_strava");

  if (error) {
    throw mapSupabaseError(error, "No se pudo desconectar Strava.");
  }

  forgetStravaConnection(currentMember.id);

  const updatedMember = await fetchCurrentProfileWithClient();
  if (!updatedMember) {
    throw new Error("No hemos podido recargar tu perfil tras desconectar Strava.");
  }

  return updatedMember;
}
