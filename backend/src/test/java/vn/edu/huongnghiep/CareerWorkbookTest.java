package vn.edu.huongnghiep;
import java.io.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import static org.assertj.core.api.Assertions.*;
import vn.edu.huongnghiep.modules.careers.*;

class CareerWorkbookTest {
    private final CareerWorkbookReader reader=new CareerWorkbookReader();
    byte[] source()throws Exception{try(var s=new ClassPathResource("seed/careers-source.xlsx").getInputStream()){return s.readAllBytes();}}
    @Test void readsAllUserRowsWithoutMergingDuplicateVietnameseNames()throws Exception {
        var p=reader.read(source(),null);assertThat(p.errors()).isEmpty();assertThat(p.rows()).hasSize(378);
        assertThat(p.rows().stream().filter(r->r.nameVi().equals("Nữ hộ sinh")).toList()).hasSize(2);
        assertThat(p.rows().stream().map(CareerWorkbookReader.RowData::code).distinct().count()).isEqualTo(378);
    }
    @Test void templateIsAValidWorkbookWithExplicitRelationships()throws Exception {
        byte[] bytes;try(var s=new ClassPathResource("templates/catalog-v1.xlsx").getInputStream()){bytes=s.readAllBytes();}
        var p=reader.read(bytes,null);assertThat(p.sheet()).isEqualTo("NGHE_NGHIEP");assertThat(p.errors()).isEmpty();assertThat(p.rows()).hasSize(1);assertThat(p.supplements().majors()).hasSize(3);assertThat(p.supplements().programs()).hasSize(2);
    }
    @Test void reorderedColumnsAreMatchedByHeaderRatherThanPosition()throws Exception {
        try(var wb=new XSSFWorkbook(new ByteArrayInputStream(source()));var out=new ByteArrayOutputStream()) {
            var sh=wb.getSheetAt(0);for(var row:sh) {String a=row.getCell(0).getStringCellValue(),b=row.getCell(3).getStringCellValue();row.getCell(0).setCellValue(b);row.getCell(3).setCellValue(a);}wb.write(out);
            assertThat(reader.read(out.toByteArray(),null).errors()).isEmpty();assertThat(reader.read(out.toByteArray(),null).rows().getFirst().code()).isEqualTo("11-1011.00");
        }
    }
    @Test void rejectsDuplicateCodesAndFormulasWithExcelRowNumber()throws Exception {
        try(var wb=new XSSFWorkbook(new ByteArrayInputStream(source()));var out=new ByteArrayOutputStream()) {
            var sh=wb.getSheetAt(0);sh.getRow(2).getCell(0).setCellValue(sh.getRow(1).getCell(0).getStringCellValue());sh.getRow(1).getCell(4).setCellFormula("1+1");wb.write(out);var p=reader.read(out.toByteArray(),null);
            assertThat(p.errors()).anySatisfy(e->{assertThat(e.row()).isEqualTo(3);assertThat(e.message()).contains("trùng");});assertThat(p.errors()).anySatisfy(e->assertThat(e.message()).contains("công thức"));
        }
    }
    @Test void incompleteSalaryCannotBeImportedAsVietnameseSalary()throws Exception {
        try(var wb=new XSSFWorkbook(new ClassPathResource("templates/catalog-v1.xlsx").getInputStream());var out=new ByteArrayOutputStream()) {
            var sh=wb.getSheet("NGHE_NGHIEP");sh.getRow(1).getCell(10).setCellValue(30000000);wb.write(out);assertThat(reader.read(out.toByteArray(),null).errors()).anySatisfy(e->assertThat(e.message()).contains("đủ"));
        }
    }
    @Test void careerWithoutInformationalMajorsCanBeImportedAgainAfterExport()throws Exception {
        try(var wb=new XSSFWorkbook(new ByteArrayInputStream(source()));var out=new ByteArrayOutputStream()) {
            wb.getSheetAt(0).getRow(1).getCell(5).setBlank();wb.write(out);
            var parsed=reader.read(out.toByteArray(),null);
            assertThat(parsed.errors()).isEmpty();assertThat(parsed.rows().getFirst().majors()).isEmpty();
        }
    }
    @Test void fallbackFitExplainsWeightsAndZeroProfileHasNoFit() {
        var c=new CareerFitCalculator();assertThat(c.compare(Map.of("I",90.0,"R",60.0,"C",30.0),"IRC").score()).isEqualTo(70);
        assertThat(c.compare(Map.of("I",0.0),"IRC").score()).isNull();assertThat(c.compare(null,"IRC").score()).isNull();
    }
}
