import { NextApiRequest, NextApiResponse } from "next";
import { Abfahrt, MilesClient } from "abfahrt";
import { DataSource } from "typeorm";
import { MilesEntities } from "../../../Miles/_MilesEntities";
import env from "../../../env";
import { VehicleLastKnown } from "../../../Miles/VehicleLastKnown";
// import { AppDataSource } from "../../../../scraper/src/dataSource"

// new InfluxDB({ url: "http://167.235.149.238:8086", token: "", timeout: 60000 }).getWriteApi("vorfahrt", "miles", "s");

const berlinArea: Abfahrt.Area = {
  latitude: 52.52,
  longitude: 13.405,
  latitudeDelta: 0.34234234234,
  longitudeDelta: 0.6410410925,
};

// function Entity(target, name, descriptor) {
//   const original = descriptor.value;
//   if (typeof original === 'function') {
//     descriptor.value = function(...args) {
//       console.log(`Arguments for ${name}: ${args}`);
//       return original.apply(this, args);
//     }
//   }
//   return descriptor;
// }
// class MyClass {
//   @Entity
//   myMethod(arg1, arg2) {
//     console.log(arg1, arg2);
//   }
// }
// const myClassInstance = new MyClass();

// myClassInstance.myMethod(1, 2);

// function logClass(target: any) {
//   // Save a reference to the original constructor
//   const original = target;

//   // A utility function to generate instances of a class
//   function construct(constructor: any, args: any) {
//     const c = function(): void {
//       return new constructor.apply(this, args);
//     }
//     c.prototype = constructor.prototype;
//     return new c();
//   }

//   // The new constructor behavior
//   const newConstructor = function(...args: any[]) {
//     console.log(`Creating new instance of ${original.name} with arguments:`, args);
//     return construct(original, args);
//   };

//   // Copy prototype so instanceof operator still works
//   newConstructor.prototype = original.prototype;

//   // Return new constructor (will override original)
//   return newConstructor;
// }

// // Example usage
// @logClass
// class DecoratorTest {
//   public arg1: number;
//   public arg2: number;

//   constructor(arg1: number, arg2: number) {
//     this.arg1 = arg1;
//     this.arg2 = arg2;
//   }
// }
// const test = new DecoratorTest(1, 2);

const AppDataSource = new DataSource({
  type: "postgres",
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  synchronize: true,
  logging: false,
  entities: MilesEntities,
  migrations: [],
  subscribers: [],
});

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!AppDataSource.isInitialized) {
      console.time("appDataSource initialized");

      await AppDataSource.initialize();

      console.timeEnd("appDataSource initialized");
    }
    console.time("all vehicles query");

    const vehicles = await AppDataSource.getRepository(VehicleLastKnown).find(
      {}
    );

    console.timeEnd("all vehicles query");

    res.json({
      ok: true,
      data: { vehicles },
    });
  } catch (err: any) {
    console.log("error occured:", err);

    res.status(500).json({
      ok: false,
    });
  }
};

export default handler;
