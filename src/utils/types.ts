export interface UserProps{
    id:number,
    username:string,
    password:string,
    complete_name:string,
    role:"staff"|"controller"|"pusat",
    access_apps:"access"|"noAccess",
    position:string,
    status:"aktif"|"nonAktif",
    created_at:Date,
    updated_at:Date,
    deleted_at:Date,
}
export interface EmployeProps{
    id:number,
    name:string,
    job_title:string,
    status:"aktif"|"nonAktif",
    created_at:Date,
    updated_at:Date,
    deleted_at:Date,}
export interface AreaProps{
    id:number,
    area_name:string,
    city:string,
    subdistrict:string,
    village:string,
    address:string,
    status:"aktif"|"nonAktif",
    created_at:Date,
    updated_at:Date,
    deleted_at:Date
    }
export interface MemberProps{
    id:number,
    complete_name:string,
    address:string,
    area_id:number,
    area:AreaProps,
    created_at:Date,
    updated_at:Date,
    deleted_at:Date
    }
export interface GroupProps{
    id:number,
    group_name:string,
    area_id:string,
    staffs:UserProps[],
    area:AreaProps,
    created_at:Date,
    updated_at:Date,
    deleted_at:Date
    }

export interface PaginationProps{
    total:number,
    page: number,
    limit: number,
    totalPages: number,
}
