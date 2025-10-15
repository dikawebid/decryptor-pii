# Decryptor PII

Decryptor PII is a Vite + React single-page app that helps you decrypt and inspect sensitive spreadsheet columns without leaving your browser. Drop in a CSV or Excel file, select the encryption algorithm plus key, preview the decrypted values column by column, and export the processed data back to CSV/XLSX (bundled as a ZIP for convenience).

## Features
- Drag-and-drop upload for `.csv`, `.xlsx`, and `.xls` files with progress feedback.
- AES decryption support (`aes-128-cbc`, `aes-256-cbc`, `aes-128-gcm`, `aes-256-gcm`) powered by [`crypsi.js`](https://www.npmjs.com/package/crypsi.js).
- Per-column toggle to decide what should be decrypted before display or export.
- Paginated data preview with live decrypted values.
- Export decrypted data to CSV or XLSX; downloads are packaged as a ZIP archive.

## Tech Stack
- React 18 with TypeScript
- Vite build tooling
- Tailwind CSS for styling
- `react-dropzone`, `xlsx`, `jszip`, and `file-saver` for the data workflow

## Prerequisites
- Node.js 18+ (or a compatible LTS release)
- npm 9+ (bundled with Node)

## Getting Started
```bash
git clone <repo-url>
cd decryptor-pii
npm install
npm run dev
```
Open the printed local URL (typically `http://localhost:5173`) to use the app.

## Usage
1. Pick the AES algorithm that matches your encrypted dataset.
2. Paste the encryption key and click **Set Encryption Key**.
3. Drag and drop a CSV/XLSX file (or click to browse).
4. Toggle the eye icon in each column header to decrypt or leave the raw value.
5. Export the processed data as CSV or XLSX. The download arrives as `exported-data.zip`.

If a value cannot be decrypted with the provided key/algorithm it is left unchanged so you can spot issues quickly.

## Available Scripts
- `npm run dev` – start the Vite dev server with hot reload.
- `npm run build` – generate a production bundle in `dist/`.
- `npm run preview` – serve the production build locally.
- `npm run lint` – run ESLint across the codebase.
- `npm run deploy` – deploy the built app to GitHub Pages (`dist/`).

## Contributing
Pull requests are welcome—especially during Hacktoberfest! Please keep changes focused: open an issue or discussion for larger features, run `npm run lint`, and include testing notes where relevant.

## License
No explicit license is provided yet. If you plan to use this project beyond local experimentation, please reach out or open an issue to clarify licensing.

## Contributors
Thanks to all who have contributed to this project!

- [@rbayuokt](https://github.com/rbayuokt)