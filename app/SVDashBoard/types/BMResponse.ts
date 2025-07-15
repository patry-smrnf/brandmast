export interface BMResData {
    id_bm: number,
    login: string,
    sv_id: number,
    team_id: number,
    type: string,
    area_name: string,
    akcje: Akjca[]
};

export interface Akjca {
    id_akcja: number,
    status: string,
    date: string,
    type: string,
    address: string,
    szkolenie: boolean,
    start_sys: string,
    stop_sys: string,
    start_real: string,
    stop_real: string
};