package io.github.hulang1024.chinesechess.upload;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.UUID;

@Service
public class AvatarService {
    @Value("${avatar.path}")
    private String avatarPath;
    @Value("${avatar.dir}")
    private String avatarDir;

    public String saveAvatarByUrl(String avatarUrl) {
        try {
            Response response = new OkHttpClient().newCall(new Request.Builder().url(avatarUrl).build()).execute();
            String contentType = response.header("content-type");
            String subType = contentType.split("/")[1];

            String fileNameExt = subType;
            String fileName = UUID.randomUUID().toString().replace("-", "") + "." + fileNameExt;

            try (InputStream in = response.body().byteStream();
                 FileOutputStream out = new FileOutputStream(new File(avatarDir, fileName), true);) {
                byte[] bs = new byte[1024];
                for (int len; (len = in.read(bs)) != -1; ) {
                    out.write(bs, 0, len);
                }
            }
            return avatarPath + "/" + fileName;
        } catch (Exception e) {
            return null;
        }
    }
}
