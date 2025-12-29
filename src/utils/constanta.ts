export interface PosisiUsahaMap {
  readonly MODALDO: string;
  readonly STORTING: string;
  readonly TARGET: string;
  readonly TARGET_ANGGOTA: string;
}

// 2. Implementasikan dengan 'as const' untuk keamanan maksimal
const posisiUsahaCode: PosisiUsahaMap = {
  MODALDO: "modaldo",
  STORTING: "storting",
  TARGET: "target",
  TARGET_ANGGOTA: "targetanggota",
} as const;

export  {
    posisiUsahaCode,
};
