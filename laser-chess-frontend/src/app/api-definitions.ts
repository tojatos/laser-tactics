import { environment } from "src/environments/environment";

export const fullEndpoint = (endpoint: String, sub: String = "") => `${environment.API_URL}${environment.API_PREFIX}${endpoint}${sub}`

export const userEndpoint = '/users'
export const friendsEndpoint = '/users/me/friends'
export const tokenEndpoint = '/token'
export const lobbyEndpoint = '/lobby'
export const updateLobbyEndpoint = '/lobby/update'
export const createLobbyEndpoint = '/lobby/create'
export const joinLobbyEndpoint = '/lobby/join'
export const leaveLobbyEndpoint = '/lobby/leave'
export const gameEndpoint = '/game'
export const startGameEndpoint = '/lobby/start_game'
export const gameStateEndpoint = '/get_game_state'
export const settingsEndpoint = '/users/me/settings'
export const movePieceEndpoint = '/move_piece'
export const rotatePieceEndpoint = '/rotate_piece'
export const shootLaserEndpoint = '/shoot_laser'
export const giveUpEndpoint = '/give_up'
export const offerDrawEndpoint = '/offer_draw'
export const authWebsocketEndpoint = '/ws_auth'
export const observeWebsocketEndpoint = '/ws_observe'
export const initialGameEndpoint = '/game/initial_game_state'

export const usersFullEndpoint = fullEndpoint(userEndpoint)
export const tokenFullEndpoint = fullEndpoint(tokenEndpoint)
export const gameStateFullEndpoint = fullEndpoint(gameStateEndpoint)
export const movePieceFullEndpoint = fullEndpoint(movePieceEndpoint)
export const rotatePieceFullEndpoint = fullEndpoint(rotatePieceEndpoint)
export const shootLaserFullEndpoint = fullEndpoint(shootLaserEndpoint)
export const leaveLobbyFullEndpoint = (id: string = "") => fullEndpoint(leaveLobbyEndpoint, id ? `/${id}` : '')
export const startGameFullEndpoint = fullEndpoint(startGameEndpoint)
export const friendsFullEndpoint = (id: string  = "") => fullEndpoint(friendsEndpoint, id ? `/${id}` : '')
export const lobbyFullEndpoint = (id: string = "") => fullEndpoint(lobbyEndpoint, id ? `/${id}` : '')
export const settingsFullEndpoint = fullEndpoint(settingsEndpoint)
export const updateLobbyFullEndpoint = (id: string = "") => fullEndpoint(updateLobbyEndpoint, id ? `/${id}` : '')
export const createLobbyFullEndpoint = (id: string = "") => fullEndpoint(createLobbyEndpoint, id ? `/${id}` : '')
export const joinLobbyFullEndpoint = (id: string = "") => fullEndpoint(joinLobbyEndpoint, id ? `/${id}` : '')
export const gameFullEndpoint = (id: string  = "") => fullEndpoint(gameEndpoint, id ? `/${id}` : '')
export const userFullEndpoint = (id: string  = "") => fullEndpoint(userEndpoint, id ? `/${id}` : '')
export const giveUpFullEndpoint = fullEndpoint(giveUpEndpoint)
export const offerDrawFullEndpoint = fullEndpoint(offerDrawEndpoint)
export const initalGameStateFullEndpoint = fullEndpoint(initialGameEndpoint)
