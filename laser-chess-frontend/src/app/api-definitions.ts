import { environment } from "src/environments/environment";

export const fullEndpoint = (endpoint: String, sub: String = "") => `${environment.API_URL}${environment.API_PREFIX}${endpoint}${sub}`

export const usersEndpoint = '/users'
export const tokenEndpoint = '/token'
export const lobbyEndpoint = '/lobby'
export const updateLobbyEndpoint = '/lobby/update'
export const createLobbyEndpoint = '/lobby/create'
export const joinLobbyEndpoint = '/lobby/join'
export const userEndpoint = '/users'
export const gameEnpoint = '/game'
export const startGameEndpoint = '/start_game'
export const gameStateEndpoint = '/get_game_state'
export const movePieceEndpoint = '/move_piece'
export const rotatePieceEndpoint = '/rotate_piece'
export const shootLaserEndpoint = '/shoot_laser'
export const authWebsocketEndpoint = '/ws_auth'
export const observeWebsocketEndpoint = '/ws_observe'

export const usersFullEndpoint = fullEndpoint(usersEndpoint)
export const tokenFullEndpoint = fullEndpoint(tokenEndpoint)
export const gameStateFullEndpoint = fullEndpoint(gameStateEndpoint)
export const movePieceFullEndpoint = fullEndpoint(movePieceEndpoint)
export const rotatePieceFullEndpoint = fullEndpoint(rotatePieceEndpoint)
export const shootLaserFullEndpoint = fullEndpoint(shootLaserEndpoint)
export const lobbyFullEndpoint = (id: string = "") => fullEndpoint(lobbyEndpoint, id ? `/${id}` : '')
export const updateLobbyFullEndpoint = (id: string = "") => fullEndpoint(updateLobbyEndpoint, id ? `/${id}` : '')
export const createLobbyFullEndpoint = (id: string = "") => fullEndpoint(createLobbyEndpoint, id ? `/${id}` : '')
export const joinLobbyFullEndpoint = (id: string = "") => fullEndpoint(joinLobbyEndpoint, id ? `/${id}` : '')
export const gameFullEndpoint = (id: string  = "") => fullEndpoint(gameEnpoint, id ? `/${id}` : '')
export const startGameFullEndpoint = fullEndpoint(startGameEndpoint)
export const userFullEndpoint = (id: string  = "") => fullEndpoint(userEndpoint, id ? `/${id}` : '')



