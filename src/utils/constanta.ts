export interface PosisiUsahaMap {
  readonly MODALDO: string;
  readonly STORTING: string;
  readonly TARGET: string;
  readonly TARGET_ANGGOTA: string;
  readonly IP: string;
  readonly SIRKULASI: string;
  readonly SIRKULASI_JALAN: string;
  readonly SU: string;
  readonly PD: string;
  readonly NAIK_TURUN: string;
}

// 2. Implementasikan dengan 'as const' untuk keamanan maksimal
const posisiUsahaCode: PosisiUsahaMap = {
  MODALDO: "modaldo",
  STORTING: "storting",
  TARGET: "target",
  TARGET_ANGGOTA: "targetanggota",
  IP: "ip",
  SIRKULASI: "sirkulasi",
  SIRKULASI_JALAN: "sirkulasi_jalan",
  SU: "su",
  PD: "pd",
  NAIK_TURUN: "naik_turun",
} as const;

export  {
    posisiUsahaCode,
};
