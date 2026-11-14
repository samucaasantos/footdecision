import {
  AuthResponseDTO,
  ClubConfigUpdateDTO,
  DashboardOverviewDTO,
  LoginRequestDTO,
  PlayerReportDTO,
  SimulationRequestDTO,
  SimulationResponseDTO,
  SquadPlayerRequestDTO,
  SquadPlayerResponseDTO,
  StandardError,
  UserRegisterDTO,
  UserResponseDTO,
} from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

export const TOKEN_STORAGE_KEY = "footdecision_jwt_token";
export const USER_STORAGE_KEY = "footdecision_auth_user";

// Persistent UI state keys (preserved across page navigation and logout/login)
export const DASHBOARD_STATE_STORAGE_KEY = "footdecision_dashboard_state_v1";
export const SIMULATION_STATE_STORAGE_KEY = "footdecision_simulation_state_v1";
export const LAST_DOSSIER_ID_STORAGE_KEY = "footdecision_last_dossier_id_v1";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errorType: string;
  public readonly path?: string;

  constructor(standardError: Partial<StandardError> & { message: string; status: number }) {
    super(standardError.message);
    this.name = "ApiClientError";
    this.status = standardError.status;
    this.errorType = standardError.error || "API Error";
    this.path = standardError.path;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiClientError({
      status: 0,
      error: "NetworkError",
      message: "Não foi possível conectar ao servidor.",
      path,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const errorBody = (await response.json()) as Partial<StandardError>;
      throw new ApiClientError({
        status: errorBody.status ?? response.status,
        error: errorBody.error ?? response.statusText,
        message:
          errorBody.message ||
          (response.status === 401
            ? "Sessão expirada ou credenciais inválidas."
            : response.status === 403
              ? "Acesso negado: seu perfil não possui permissão para realizar esta operação."
              : "Não foi possível concluir a operação solicitada."),
        path: errorBody.path ?? path,
      });
    }

    throw new ApiClientError({
      status: response.status,
      error: response.statusText,
      message:
        response.status === 401
          ? "Não autorizado. Faça login novamente."
          : response.status === 403
            ? "Acesso negado para esta operação."
            : "Erro inesperado na comunicação com o servidor.",
      path,
    });
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return undefined as T;
}

export const api = {
  auth: {
    login: (payload: LoginRequestDTO) =>
      request<AuthResponseDTO>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    register: (payload: UserRegisterDTO) =>
      request<UserResponseDTO>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  dashboard: {
    getOverview: () => request<DashboardOverviewDTO>("/api/dashboard/overview"),

    updateConfig: (payload: ClubConfigUpdateDTO) =>
      request<DashboardOverviewDTO>("/api/dashboard/config", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    getSquad: () => request<SquadPlayerResponseDTO[]>("/api/dashboard/squad"),

    addSquadPlayer: (payload: SquadPlayerRequestDTO) =>
      request<SquadPlayerResponseDTO>("/api/dashboard/squad", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    removeSquadPlayer: (id: number) =>
      request<void>(`/api/dashboard/squad/${id}`, {
        method: "DELETE",
      }),
  },

  simulations: {
    run: (payload: SimulationRequestDTO) =>
      request<SimulationResponseDTO>("/api/simulations/run", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  players: {
    getReport: (id: number) => request<PlayerReportDTO>(`/api/players/${id}/report`),
  },
};
