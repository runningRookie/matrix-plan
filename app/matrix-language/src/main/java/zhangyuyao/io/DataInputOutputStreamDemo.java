/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.io.*;

/**
 * @author zyy43688
 * @version $Id: DataInputOutputStreamDemo.java, v 0.1 2018年2月28日 下午2:01:19 zyy43688 Exp $
 */
public class DataInputOutputStreamDemo {
    public static void main(String[] args) throws IOException {
        File file = new File("E:/output.data");
        if (!file.exists()) {
            file.createNewFile();
        }

        OutputStream outputStream = new FileOutputStream(file);

        DataOutputStream dataOutputStream = new DataOutputStream(outputStream);

        dataOutputStream.writeInt(19941217);
        dataOutputStream.writeInt(19941217);
        dataOutputStream.writeInt(19941217);
        dataOutputStream.writeBoolean(true);
        dataOutputStream.writeDouble(0.618);

        dataOutputStream.close();
        outputStream.close();

        System.out.println("写入数据完成！");

        InputStream inputStream = new FileInputStream(file);
        DataInputStream dataInputStream = new DataInputStream(inputStream);

        int i = dataInputStream.readInt();
        int i1 = dataInputStream.readInt();
        int i2 = dataInputStream.readInt();
        boolean b = dataInputStream.readBoolean();
        double d = dataInputStream.readDouble();

        System.out.println(i);
        System.out.println(i1);
        System.out.println(i2);
        System.out.println(b);
        System.out.println(d);

        dataInputStream.close();
        inputStream.close();
    }
}