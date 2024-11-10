# Analysis of vorfahrt data

## Setup

1. Get the phase 1 dataset [from Google Drive](https://drive.google.com/drive/folders/12a90qLwjNpn3x2uU9DKYHmXFjsqgl4_t)
2. Start the influx and postgres databases using `docker-compose up` (add `-d` if you want to run in the background)
3. Restore the postgres dataset:

   ```bash
   docker cp /path/to/pg_dump/dir analysis-postgres-1:/tmp
   docker exec -it analysis-postgres-1 createdb -U postgres vorfahrt
   docker exec -it analysis-postgres-1 pg_restore -U postgres -d vorfahrt --format=d /tmp/pg_dump
   ```

   You will get a handful of errors about the 'readaccess' role not existing, but this is fine for our purposes.

4. Restore the dataset for influx:

   ```bash
    docker cp /path/to/influx_backup analysis-influx-1:/tmp
    docker exec -it analysis-influx-1 influx setup -u vorfahrt -o vorfahrt -p vorfahrt -b vorfahrt -t localtoken -f
    docker exec -it analysis-influx-1 influx restore /tmp/influx
    ```

    This might take a few minutes, there are 37 shards to restore.

5. Done :)
