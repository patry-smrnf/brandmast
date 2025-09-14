export interface BMResData {
    bm_id: number,
    bm_login: string,
    bm_imie: string,
    bm_nazwisko: string,
    supervisor_id: number,
    area_name: string,
    team_type: string,
    actions: Akjca[]
};

export interface Akjca {
    action_id: number,
    action_date: string,
    action_system_start: string,
    action_system_end: string,
    shop_id: number,
    shop_name: string,
    shop_address: string
};