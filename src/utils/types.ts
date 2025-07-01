export interface UserProps{
    id:number,
    username:string,
    password:string,
    complete_name:string,
    role:"staff"|"controller"|"pusat",
    access_apps:"access"|"noAccess",
    position:string,
    status:"aktif"|"nonAktif",
    status_ijazah:"sudah diambil"|"belum diambil",
    jenis_ijazah:string,
    pos_id:string,
    pos:PosProps,
    tanggal_masuk:Date,
    tanggal_keluar:Date,
    created_at:Date,
    updated_at:Date,
    deleted_at:Date,
}
export interface EmployeProps{
    id:number,
    nip:string,
    address:string,
    name:string,
    job_title:string,
    status:"aktif"|"nonAktif",
   pos_id:string,
    pos:PosProps,
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
    pos_id:string,
    pos:PosProps,
    created_at:Date,
    updated_at:Date,
    deleted_at:Date
    }
export interface ScheduleProps{
    id:number,
    area_id:number,
    area:AreaProps,
    group_id:number,
    group:GroupProps,
    day:"senin"|"selasa"|"rabu"|"kamis"|"jum'at"|"sabtu"|"minggu",
    status:"aktif"|"nonAktif",
    pos_id:string,
    pos:PosProps,
    created_at:Date,
    updated_at:Date,
    deleted_at:Date
    }
export interface AngsuranProps{
    id:number,
    jumlah_bayar:number,
    jumlah_angsuran?:number,
    jumlah_katrol:number,
    asal_pembayaran:"anggota"|"penagih"|"katrol",
    status:"lunas"|"menunggak"|"aktif"|"libur",

    tanggal_pembayaran:Date,
    }
export interface LoanProps{
    id: number;
    anggota_id: number;
    anggota:MemberProps,
    kode: string;
    jumlah_pinjaman: number;
    persen_bunga: number;
    total_bunga: number;
    total_pinjaman: number;
    total_pinjaman_diterima: number;
    jumlah_angsuran: number;
    tanggal_angsuran_pertama: string;
    modal_do: number;
    penanggung_jawab: string;
    penanggungJawab:UserProps[],
    petugas_input: string;
    petugas:UserProps,
    sisa_pembayaran: number;
    besar_tunggakan: number;
    angsuran:AngsuranProps[];
    status: 'aktif' | 'lunas' | 'menunggak';
    pos_id:string,
    pos:PosProps,
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    }
export interface MemberProps{
    id:number,
    nik:string,
    no_kk:string,
    complete_name:string,
    address:string,
    area_id:number,
    area:AreaProps,
    sequence_number:number,
    pos_id:string,
    description:string,
    pos:PosProps,
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
    pos_id:string,
    pos:PosProps,
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

export interface PosProps{
    id:number,
    nama_pos: string,
    alamat: string,
    penanggung_jawab: string;
    penanggungJawab:UserProps,
    no_telepon: string,
}
