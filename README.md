# Vorfahrt

A platform for retrieving information about micromobility services like MILES Mobility GmbH with focus on the Berlin area.

This repository includes our [scraper](/backend/scraper/), [cached api](/backend/api/), [web app](/apps/web-client/), [mobile app](/apps/mobile-app/), and [admin interface](/apps/stats-web/). Please find get started guides in the respective subdirectories.

Our Miles SDK *abfahrt* is currently private to not encourage abuse. The scraper and mobile app will not work without them, contact us for more information.

## Cloning abfahrt - Miles SDK

Some modules (specifically, the scraper) require abfahrt. This is now done via a submodule, no longer via a private package. 

To fetch abfahrt, run:

```
git submodule update --init
```

To fetch upstream changes later, run `git submodule update --remote`

## Project Structure

![Vorfahrt Project Structure](./docs/Project%20Structure.drawio.svg)