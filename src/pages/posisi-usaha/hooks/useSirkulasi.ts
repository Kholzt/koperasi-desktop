import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import { posisiUsahaCode } from "../../../utils/constanta";
interface Props {
  drop: number;
  storting: number;
  group_id: number;
  target_minggu_lalu: number;
  tanggal_input: string;
  code: string;
  raw_formula: string;
  total: number;
}
function useSirkulasi(
  date?: string | null,
  group?: number | null,
  stortingThisWeek?: number | null,
  id?: number,
) {
  const [sirkulasiMingguLalu, setSirkulasiMingguLalu] = useState(0);
  const [stortingThisWeekTotal, setStortingThisWeek] = useState(0);
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const hasDateAndGroup = date && group;

    if (hasDateAndGroup) {
      axios
        .get(
          `api/posisi-usaha/data-minggu-lalu?tanggal_input=${date}&group_id=${group}&code=${posisiUsahaCode.SIRKULASI}`,
        )
        .then((d) => {
          setSirkulasiMingguLalu(d.data.target_minggu_lalu || 0);
        });
      axios
        .get(
          `api/posisi-usaha/data-this-week?tanggal_input=${date}&code=${posisiUsahaCode.STORTING}`,
        )
        .then((d) => {
          setStortingThisWeek(d.data.amount || 0);
        });
    }
    console.log(stortingThisWeek);

  }, [date, group]);
  useEffect(() => {
    const hasData = id;
    if (hasData) {
      axios
        .get(`api/posisi-usaha/${id}`)
        .then((d) => setData(d.data.posisi_usaha));
    }
  }, [id]);

  const onsubmit = async (data: Props) => {
    const result =
      Number(data.drop) * 0.13 -
      Number(data.storting) +
      Number(data.target_minggu_lalu);
    data.total = result;
    data.raw_formula = JSON.stringify({
      drop: data.drop,
      storting: data.storting,
    });
    console.log(result);

    try {
      const isEdit = id;
      let res;
      if (isEdit) {
        res = await axios.put(`api/posisi-usaha/save/${id}`, data);
      } else {
        res = await axios.post("api/posisi-usaha/save", data);
      }

      return res.status;
    } catch (error) {
      console.log("ERROR", error);

      return 500;
    }
  };

  return { sirkulasiMingguLalu, stortingThisWeekTotal, onsubmit, data };
}

export default useSirkulasi;
