export function convertToCSV<T extends object>(data: T[]) {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]) as Array<keyof T>;
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const cell = row[header];
      const escaped =
        cell === undefined || cell === null
          ? ""
          : String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

export function downloadCSV(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
