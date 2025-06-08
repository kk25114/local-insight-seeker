const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const docx = require('docx');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 导出Excel
app.post('/export/excel', async (req, res) => {
  const { data, title } = req.body;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return res.status(400).send('No data provided for Excel export.');
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title || 'Sheet 1');

    // 添加表头
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map(header => ({ header, key: header, width: 20 }));

    // 添加数据行
    worksheet.addRows(data);

    const fileName = title || 'export';
    const encodedFileName = encodeURIComponent(fileName);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}.xlsx; filename="${encodedFileName}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).send('Failed to export Excel file.');
  }
});

// 导出PDF
app.post('/export/pdf', (req, res) => {
    const { data, title } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).send('No data provided for PDF export.');
    }

    try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        const fileName = title || 'export';
        const encodedFileName = encodeURIComponent(fileName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}.pdf; filename="${encodedFileName}.pdf"`);

        doc.pipe(res);

        // 添加标题
        doc.fontSize(20).text(title || 'Exported Data', { align: 'center', underline: true });
        doc.moveDown();

        // 绘制表格
        const tableTop = doc.y;
        const headers = Object.keys(data[0]);
        const colWidth = (doc.page.width - 60) / headers.length;

        // 绘制表头
        doc.fontSize(10);
        headers.forEach((header, i) => {
            doc.text(header, 30 + i * colWidth, tableTop, { width: colWidth, align: 'center' });
        });
        const headerBottom = doc.y;
        doc.moveTo(30, headerBottom).lineTo(doc.page.width - 30, headerBottom).stroke();
        doc.moveDown();

        // 绘制数据行
        data.forEach(row => {
            const rowTop = doc.y;
            headers.forEach((header, i) => {
                doc.text(String(row[header]), 30 + i * colWidth, rowTop, { width: colWidth, align: 'center' });
            });
            const rowBottom = doc.y + 15;
            doc.moveTo(30, rowBottom).lineTo(doc.page.width - 30, rowBottom).stroke();
            doc.y = rowBottom;
            doc.moveDown(0.5)
        });

        doc.end();
    } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).send('Failed to export PDF file.');
    }
});

// 导出Word (.docx)
app.post('/export/word', async (req, res) => {
    const { data, title } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).send('No data provided for Word export.');
    }

    try {
        const headers = Object.keys(data[0]).map(key => new docx.TableCell({
            children: [new docx.Paragraph({ text: key, bold: true })],
        }));

        const rows = data.map(rowData => new docx.TableRow({
            children: Object.values(rowData).map(cellData => new docx.TableCell({
                children: [new docx.Paragraph(String(cellData))],
            })),
        }));

        const table = new docx.Table({
            rows: [new docx.TableRow({ children: headers }), ...rows],
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
        });

        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: [
                    new docx.Paragraph({
                        children: [new docx.TextRun({ text: title || 'Exported Data', bold: true, size: 32 })],
                        alignment: docx.AlignmentType.CENTER,
                    }),
                    table,
                ],
            }],
        });
        
        const buffer = await docx.Packer.toBuffer(doc);

        const fileName = title || 'export';
        const encodedFileName = encodeURIComponent(fileName);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}.docx; filename="${encodedFileName}.docx"`);
        res.send(buffer);

    } catch (error) {
        console.error('Word export error:', error);
        res.status(500).send('Failed to export Word file.');
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
}); 