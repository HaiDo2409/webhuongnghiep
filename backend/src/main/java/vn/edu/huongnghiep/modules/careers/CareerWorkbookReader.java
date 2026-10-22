package vn.edu.huongnghiep.modules.careers;

import java.io.*;
import java.util.*;
import java.text.Normalizer;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.springframework.stereotype.Component;
import vn.edu.huongnghiep.shared.ApiException;

@Component
public class CareerWorkbookReader {
    public record RowData(int row,String code,String holland,String nameEn,String nameVi,String description,List<String> majors,List<String> groups,Map<String,String> extras) {}
    public record Issue(int row,String column,String message) {}
    public record Parsed(String sheet,List<RowData> rows,List<Issue> errors,CatalogSupplementReader.Data supplements) {}
    private static final List<List<String>> HEADERS=List.of(
        List.of("Mã nghề (O*NET-SOC)","onet_soc_code"),List.of("Mã Holland (RIASEC)","holland_code"),
        List.of("Tên nghề tiếng Anh (Gốc)","job_title_en"),List.of("Tên nghề tiếng Việt (Chuẩn hóa)","job_title_vi"),
        List.of("Mô tả ngắn tiếng Việt","description_vi"),List.of("Ngành đại học tương ứng tại Việt Nam","vn_university_majors"),List.of("Nhóm ngành lớn","career_groups"));
    public static String key(String value) { return Normalizer.normalize(value.strip(),Normalizer.Form.NFC).toLowerCase(Locale.ROOT).replaceAll("\\s+"," "); }
    private static List<String> tokens(String value,String separator) { return Arrays.stream(value.split(separator)).map(String::strip).filter(v->!v.isEmpty()).distinct().toList(); }
    public Parsed read(byte[] bytes,String selectedSheet) {
        if(bytes.length==0 || bytes.length>2*1024*1024) throw ApiException.invalid("File Excel cần nhỏ hơn 2 MB và không rỗng.");
        ZipSecureFile.setMaxEntrySize(20*1024*1024);ZipSecureFile.setMaxTextSize(20*1024*1024);
        try(var workbook=new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            if(workbook.isMacroEnabled() || workbook.getExternalLinksTable().size()>0) throw ApiException.invalid("Không nhận file có macro hoặc liên kết workbook bên ngoài.");
            if(workbook.getNumberOfSheets()>10) throw ApiException.invalid("File có quá nhiều sheet (tối đa 10).");
            var supplements=CatalogSupplementReader.read(workbook);
            Sheet sheet=selectedSheet==null||selectedSheet.isBlank()?(workbook.getSheet("NGHE_NGHIEP")==null?workbook.getSheetAt(0):workbook.getSheet("NGHE_NGHIEP")):workbook.getSheet(selectedSheet);
            if(sheet==null || sheet.getRow(0)==null) throw ApiException.invalid("Không tìm thấy sheet hoặc dòng tiêu đề.");
            if(sheet.getLastRowNum()>10000) throw ApiException.invalid("Mỗi file chỉ nhập tối đa 10.000 dòng.");
            DataFormatter formatter=new DataFormatter(Locale.ROOT);Map<String,Integer> headers=new HashMap<>();
            for(Cell cell:sheet.getRow(0)) { String name=key(formatter.formatCellValue(cell));if(!name.isBlank() && headers.put(name,cell.getColumnIndex())!=null) throw ApiException.invalid("Tiêu đề cột bị trùng: "+name); }
            int[] columns=new int[7];
            for(int i=0;i<7;i++) { columns[i]=-1;for(String alias:HEADERS.get(i)) if(headers.containsKey(key(alias))) columns[i]=headers.get(key(alias));if(columns[i]<0 && !(i==5 && !supplements.links().isEmpty())) throw ApiException.invalid("Thiếu cột: "+HEADERS.get(i).getFirst()); }
            List<RowData> rows=new ArrayList<>();List<Issue> errors=new ArrayList<>();Set<String> codes=new HashSet<>();
            for(int n=1;n<=sheet.getLastRowNum();n++) {
                Row row=sheet.getRow(n);if(row==null) continue;String[] values=new String[7];boolean blank=true;
                for(int i=0;i<7;i++) { Cell cell=columns[i]<0?null:row.getCell(columns[i]);values[i]=cell==null?"":formatter.formatCellValue(cell).strip();blank &= values[i].isBlank();
                    if(cell!=null && (cell.getCellType()==CellType.FORMULA || cell.getCellType()==CellType.ERROR)) errors.add(new Issue(n+1,HEADERS.get(i).getFirst(),"Chỉ nhận giá trị, không nhận công thức hoặc ô lỗi."));
                }
                if(blank) continue;
                List<String> explicitMajors=null;
                if(!supplements.links().isEmpty()) {
                    List<String> linkedNames=new ArrayList<>();
                    for(var link:supplements.links())if(link.get("onet_soc_code").equals(values[0])) for(var major:supplements.majors())if(major.get("major_key").equals(link.get("major_key")))linkedNames.add(major.get("major_name"));
                    if(!linkedNames.isEmpty()){values[5]=String.join(", ",linkedNames);explicitMajors=List.copyOf(linkedNames);}
                }
                for(int i=0;i<7;i++) if((i!=5 && values[i].isBlank()) || values[i].length()>2000) errors.add(new Issue(n+1,HEADERS.get(i).getFirst(),"Cần nội dung không rỗng và tối đa 2.000 ký tự."));
                if(!values[0].matches("\\d{2}-\\d{4}\\.\\d{2}")) errors.add(new Issue(n+1,HEADERS.get(0).getFirst(),"Mã nghề phải dạng 15-1252.00, lưu dưới dạng văn bản."));
                if(!codes.add(values[0])) errors.add(new Issue(n+1,HEADERS.get(0).getFirst(),"Mã nghề bị trùng trong file."));
                if(!values[1].matches("[RIASEC]{1,6}") || values[1].chars().distinct().count()!=values[1].length()) errors.add(new Issue(n+1,HEADERS.get(1).getFirst(),"Mã Holland chỉ gồm R/I/A/S/E/C, không lặp ký tự."));
                if(values[2].length()>255 || values[3].length()>255) errors.add(new Issue(n+1,"Tên nghề","Tên nghề tối đa 255 ký tự."));
                var majors=explicitMajors==null?tokens(values[5],","):explicitMajors;var groups=tokens(values[6],";");
                if(majors.stream().anyMatch(v->v.length()>255) || groups.stream().anyMatch(v->v.length()>255) || majors.size()>30 || groups.size()>30) errors.add(new Issue(n+1,"Ngành/nhóm","Tên ngành/nhóm quá dài hoặc có quá nhiều mục (tối đa 30)."));
                Map<String,String> extras=new LinkedHashMap<>();
                for(String extra:List.of("stem_groups","skills_vi","salary_min_vnd","salary_max_vnd","salary_period","salary_region","salary_year","salary_source_url","outlook_vi","outlook_region","outlook_year","outlook_source_url","source_url","data_year","published"))
                    if(headers.containsKey(extra)) {Cell cell=row.getCell(headers.get(extra));String value=cell==null?"":formatter.formatCellValue(cell).strip();
                        if(cell!=null && (cell.getCellType()==CellType.FORMULA||cell.getCellType()==CellType.ERROR)) errors.add(new Issue(n+1,extra,"Không nhận công thức hoặc ô lỗi."));if(value.length()>2000)errors.add(new Issue(n+1,extra,"Tối đa 2.000 ký tự."));if(!value.isBlank())extras.put(extra,value);}
                for(String field:List.of("salary_min_vnd","salary_max_vnd")) if(extras.containsKey(field) && !extras.get(field).matches("\\d{1,12}")) errors.add(new Issue(n+1,field,"Nhập số nguyên VND, không dấu phân cách, tối đa 12 chữ số."));
                if(extras.containsKey("salary_min_vnd")!=extras.containsKey("salary_max_vnd")) errors.add(new Issue(n+1,"salary","Cần đủ mức thấp nhất và cao nhất."));
                if(extras.containsKey("salary_max_vnd")) {
                    for(String field:List.of("salary_period","salary_region","salary_year","salary_source_url")) if(!extras.containsKey(field)) errors.add(new Issue(n+1,field,"Dữ liệu lương cần đơn vị, khu vực, năm và nguồn."));
                    if(!"MONTH".equals(extras.get("salary_period"))) errors.add(new Issue(n+1,"salary_period","Chỉ hỗ trợ lương VND theo tháng: MONTH."));
                    if(extras.getOrDefault("salary_min_vnd","").matches("\\d{1,12}") && extras.get("salary_max_vnd").matches("\\d{1,12}") && Long.parseLong(extras.get("salary_min_vnd"))>Long.parseLong(extras.get("salary_max_vnd"))) errors.add(new Issue(n+1,"salary","Mức thấp nhất không được vượt mức cao nhất."));
                }
                for(String field:List.of("salary_year","outlook_year","data_year")) if(extras.containsKey(field) && !extras.get(field).matches("20\\d{2}")) errors.add(new Issue(n+1,field,"Năm phải từ 2000 đến 2099."));
                for(String field:List.of("source_url","salary_source_url","outlook_source_url")) if(extras.containsKey(field) && !validUrl(extras.get(field))) errors.add(new Issue(n+1,field,"Cần URL HTTP/HTTPS hợp lệ."));
                if(extras.containsKey("outlook_vi")) for(String field:List.of("outlook_region","outlook_year","outlook_source_url")) if(!extras.containsKey(field)) errors.add(new Issue(n+1,field,"Triển vọng cần khu vực, năm và nguồn."));
                if(extras.containsKey("published") && !Set.of("TRUE","FALSE").contains(extras.get("published"))) errors.add(new Issue(n+1,"published","Chỉ nhập TRUE hoặc FALSE."));
                if(extras.containsKey("stem_groups") && tokens(extras.get("stem_groups"),";").stream().anyMatch(v->!Set.of("S","T","E","M","OTHER").contains(v))) errors.add(new Issue(n+1,"stem_groups","Chỉ dùng S;T;E;M;OTHER."));
                rows.add(new RowData(n+1,values[0],values[1],values[2],values[3],values[4],majors,groups,extras));
            }
            if(rows.isEmpty() && supplements.programs().isEmpty()) errors.add(new Issue(2,"Dữ liệu","Workbook chưa có dữ liệu nghề hoặc chương trình."));
            return new Parsed(sheet.getSheetName(),rows,errors,supplements);
        } catch(ApiException e) {throw e;} catch(Exception e) {throw ApiException.invalid("Không đọc được Excel .xlsx. Kiểm tra file không bị mã hóa, hỏng hoặc vượt giới hạn giải nén.");}
    }
    public static boolean validUrl(String value) {try {var u=java.net.URI.create(value);return ("https".equals(u.getScheme())||"http".equals(u.getScheme()))&&u.getHost()!=null;}catch(Exception e){return false;}}
}
