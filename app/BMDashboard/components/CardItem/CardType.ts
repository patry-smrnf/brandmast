export interface CardType {
  shop_id:number,
  shop_name:string,
  shop_address:string,
  action_date:string,
  action_system_start:string,
  action_system_end:string,
  action_real_start?:string,
  action_real_end?:string,
  szkolenie:boolean,
  cta:{
    label:string,
    href:string
  },
  past:string
};