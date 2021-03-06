import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { searchProduct, searchGroupByStore } from "@utils/tokpedia";
import excel from "exceljs";
import path from "path";

class TokopediaController {
  async productSearch(
    request: Request,
    h: ResponseToolkit
  ): Promise<ResponseObject> {
    try {
      const data = await searchProduct(request.payload);
      return h.response({ data: data }).code(200);
    } catch (error) {
      return h.response(error).takeover();
    }
  }

  async productSearchByStore(
    request: Request,
    h: ResponseToolkit
  ): Promise<ResponseObject> {
    try {
      const data = await searchGroupByStore(request);
      return h.response({ data: data }).code(200);
    } catch (error) {
      return h.response(error).takeover();
    }
  }

  async eportToExcel(request: Request, h: ResponseToolkit) {
    try {
      const data = await searchProduct(request.query);
      let dataScraping: Array<object> = [];
      data.products.map((items: any) => {
        dataScraping.push({
          productName: items.productName,
          deskripsi: null,
          kategory_code: null,
          berat: 1,
          minOrder: 1,
          kondisi: null,
          gambar: items.imageUrl,
          status: "Aktif",
          stock: 1000,
          price: items.price,
        });
      });

      let workbook = new excel.Workbook();
      let worksheet: any = workbook.addWorksheet("DataProduct");

      worksheet.columns = [
        { header: "Nama Produk", key: "productName", width: 5 },
        { header: "Deskripsi Produk", key: "deskripsi", width: 25 },
        { header: "Kategori Kode", key: "kategory_code", width: 25 },
        { header: "Berat", key: "berat", width: 10 },
        { header: "Minimum Pemesanan", key: "minOrder", width: 10 },
        { header: "Kondisi", key: "kondisi", width: 10 },
        { header: "Gambar 1", key: "gambar", width: 10 },
        { header: "Status", key: "status", width: 10 },
        { header: "Jumlah Stock", key: "stock", width: 10 },
        { header: "Harga", key: "price", width: 10 },
      ];

      worksheet.addRows(dataScraping);
      const bufer = await workbook.xlsx.writeBuffer();

      return h
        .response(bufer)
        .type("text/xlsx")
        .encoding("binary")
        .header("content-Type", "application/vnd.ms-excel")
        .header("access-control-expose-headers", "Content-Disposition")
        .header("content-Disposition", 'attachment; filename="results.csv"');
    } catch (error) {
      return h.response(error).takeover();
    }
  }
}

export default new TokopediaController();
