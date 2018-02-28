/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author zyy43688
 * @version $Id: UnicodeDemo.java, v 0.1 2018年2月28日 下午1:26:43 zyy43688 Exp $
 */
public class UnicodeDemo {
    public static void main(String[] args) throws IOException {

        String name = "张";
        byte[] bytes = name.getBytes("unicode");
        for (byte b : bytes) {
            System.out.printf("%X,", b);
        }

        System.out.println();
        System.out.println(new String(new byte[] { 0x5F, 0x20 }, "unicode"));

        File file = new File("E:/output.data");

        // 如果文件不存在则创建文件
        if (!file.exists()) {
            file.createNewFile();
        }

        FileOutputStream fileOutputStream = new FileOutputStream(file);

        fileOutputStream.write(new byte[] { 0x5F, 0x20 });

        fileOutputStream.close();

        FileInputStream fileInputStream = new FileInputStream(file);

        List<Byte> byteList = new ArrayList<>();
        
        int b;
        while ((b = fileInputStream.read()) != -1) {
            byteList.add((byte) b);
        }

        System.out.println(Arrays.toString(byteList.toArray()));
        
        byte[] bytes1 = new byte[byteList.size()];
        
        // 遇到的问题就是用什么要放byte?
        for(int i = 0; i < byteList.size(); i++){
            bytes1[i] = byteList.get(i);
        }
        
        System.out.println(new String(bytes1, "unicode"));
    }
}