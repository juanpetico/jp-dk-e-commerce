import * as XLSX from 'xlsx';

type ExcelValue = string | number | boolean | null | undefined;

export type ExcelRow = Record<string, ExcelValue>;

const buildFileName = (baseName: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `${baseName}_${date}.xlsx`;
};

export const exportRowsToExcel = (
    rows: ExcelRow[],
    options: {
        fileNameBase: string;
        sheetName?: string;
    }
) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Datos');
    XLSX.writeFile(workbook, buildFileName(options.fileNameBase));
};
