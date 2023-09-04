import { NextApiRequest, NextApiResponse } from "next";
import { Abfahrt, MilesClient } from "abfahrt";

const berlinArea: Abfahrt.Area = {
  latitude: 52.52,
  longitude: 13.405,
  latitudeDelta: 0.34234234234,
  longitudeDelta: 0.6410410925,
};

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const miles = new MilesClient({ deviceKey: "d15231c7925b4517" });

    const ding = miles.createVehicleSearch(berlinArea);

    const data = await ding.execute();

    res.status(200).json({
      ok: true,
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
    });
  }
};

export default handler;
