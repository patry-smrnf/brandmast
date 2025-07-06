export interface BMData {
    username: string,
    akcje: AkcjaDetail[]
}

export interface AkcjaDetail {
    date: string,
    address: string,
    start_sys: string,
    stop_sys: string
}