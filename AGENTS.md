# Rise of Kingdoms commander tracker

This app allows to track Rise of Kingdom (RoK) Commanders.
Rise of Kingdom is a free-to-play real-time strategy game.

Commanders are usually paired (primary + secondary), and based on their Stars, Level, Talents, and Skills, they make really powerful pairs for

* PvP (Player vs. Player)
* PvE (against Barbarians)
* Resource Gatherings

## Data Storage

All data should be stored in the Browsers `localStorage`.

## Commander Fields

Each commander is tracked with the following attributes:

| Field    | Type        | Range   | Default | Notes                        |
|----------|-------------|---------|---------|------------------------------|
| Name     | text        | —       | —       | Required                     |
| Stars    | integer     | 1–6     | 6       | Clickable star buttons in UI |
| Level    | integer     | 1–60    | 60      | Slider in UI                 |
| Talents  | integer     | 0–74    | 0       | Number input                 |
| Skills   | integer × 4 | 0–5 each| 0      | S1, S2, S3, S4               |
| Notes    | text        | —       | —       | Optional free-text           |


## Intellectual Property

We need to be careful when we store intellectual property from RoK, like commander names, or attributes.
They should be put into the `data` directory, and marked as proprietary information.
