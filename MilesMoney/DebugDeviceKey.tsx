import {useEffect, useState} from "react";
import {Text, View} from "react-native";
import {
  getAndroidId,
  getBuildId,
  getDeviceId,
  getDeviceName,
  getUniqueId,
  syncUniqueId,
} from "react-native-device-info";

const DebugDeviceKey = (): JSX.Element => {
  const [androidId, setAndroidId] = useState("...");
  const [buildId, setBuildId] = useState("...");
  const [deviceId, setDeviceId] = useState("...");
  const [deviceName, setDeviceName] = useState("...");
  const [uniqueId, setUniqueId] = useState("...");
  const [syncedUniqueId, setSyncedUniqueId] = useState("...");

  useEffect(() => {
    (async () => {
      setAndroidId(await getAndroidId());
      setBuildId(await getBuildId());
      setDeviceName(await getDeviceName());
      setUniqueId(await getUniqueId());
      setSyncedUniqueId(await syncUniqueId());
    })();
    setDeviceId(getDeviceId());
  }, []);

  useEffect(() => {
    console.log(uniqueId);
  }, [uniqueId]);

  return (
    <View
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "black",
      }}>
      <Text>Debug stuff</Text>
      <Text>androidId: {androidId}</Text>
      <Text>buildId: {buildId}</Text>
      <Text>deviceId: {deviceId}</Text>
      <Text>deviceName: {deviceName}</Text>
      <Text>uniqueId: {uniqueId}</Text>
      <Text>syncedUniqueId: {syncedUniqueId}</Text>
    </View>
  );
};

export default DebugDeviceKey;
