interface PosisiUsahaMap {
  readonly MODALDO: string;
  readonly STORTING: string;
  readonly TARGET: string;
}

// 2. Implementasikan dengan 'as const' untuk keamanan maksimal
const posisiUsahaCode: PosisiUsahaMap = {
  MODALDO: "modaldo",
  STORTING: "storting",
  TARGET: "target",
} as const;

export  {
    posisiUsahaCode
};
