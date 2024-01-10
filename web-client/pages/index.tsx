import { useState } from "react";
import Map from "../components/Map";
import { ComboboxDemo } from "../@/components/ui/ComboBox";

const SHOW_SIDE_PANEL = false;

const Page = () => {
  const [sache, setSache] = useState("");

  return (
    <div className="flex flex-row w-screen h-screen bg-red-300">
      <Map />
      {SHOW_SIDE_PANEL && (
        <div className="flex flex-col w-80 h-full bg-gray-700 border-l-gray-600 border-l-2">
          <textarea value={sache} onChange={(e) => setSache(e.target.value)} />
          <ComboboxDemo />
        </div>
      )}
    </div>
  );
};
export default Page;
