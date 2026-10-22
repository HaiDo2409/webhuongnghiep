package vn.edu.huongnghiep.modules.careers;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import vn.edu.huongnghiep.shared.ApiException;

/** Standard v1 optional sheets. All keys are text, every link is explicit. */
public class CatalogSupplementReader {
    public record Data(List<Map<String,String>> majors,List<Map<String,String>> links,List<Map<String,String>> programs,List<Map<String,String>> benchmarks) {}
    public static Data read(Workbook workbook) {
        return new Data(table(workbook,"NGANH_DAO_TAO",List.of("major_key","major_name","major_code","source_url","data_year","verified")),
            table(workbook,"LIEN_KET_NGHE_NGANH",List.of("onet_soc_code","major_key")),
            table(workbook,"CHUONG_TRINH",List.of("program_key","school","short_name","program_code","major_key","admission_year","subject_groups","method","scale","formula","source_url","verified","published")),
            table(workbook,"DIEM_CHUAN",List.of("program_key","benchmark_year","subject_group","method","scale","benchmark","source_url","verified","comparable")));
    }
    private static List<Map<String,String>> table(Workbook workbook,String name,List<String> required) {
        var sheet=workbook.getSheet(name);if(sheet==null)return List.of();if(sheet.getRow(0)==null)throw ApiException.invalid(name+": thiếu tiêu đề.");
        if(sheet.getLastRowNum()>10000)throw ApiException.invalid(name+": tối đa 10.000 dòng.");
        DataFormatter f=new DataFormatter(Locale.ROOT);Map<String,Integer> headers=new LinkedHashMap<>();
        for(var cell:sheet.getRow(0)) {String key=f.formatCellValue(cell).strip();if(headers.put(key,cell.getColumnIndex())!=null)throw ApiException.invalid(name+": cột bị trùng "+key);}
        for(String key:required)if(!headers.containsKey(key))throw ApiException.invalid(name+": thiếu cột "+key);
        List<Map<String,String>> rows=new ArrayList<>();
        for(int i=1;i<=sheet.getLastRowNum();i++) {var row=sheet.getRow(i);if(row==null)continue;Map<String,String> values=new LinkedHashMap<>();
            for(var h:headers.entrySet()) {var cell=row.getCell(h.getValue());if(cell!=null&&(cell.getCellType()==CellType.FORMULA||cell.getCellType()==CellType.ERROR))throw ApiException.invalid(name+" dòng "+(i+1)+": không nhận công thức/ô lỗi.");String v=cell==null?"":f.formatCellValue(cell).strip();if(v.length()>2000)throw ApiException.invalid(name+" dòng "+(i+1)+": ô quá dài.");values.put(h.getKey(),v);}
            if(values.values().stream().allMatch(String::isBlank))continue;values.put("_row",Integer.toString(i+1));rows.add(values);
        }
        return rows;
    }
}
