/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.util.Date;

/**
 * @author zyy43688
 * @version $Id: ObjectInputOutputStream.java, v 0.1 2018年2月28日 下午2:23:17 zyy43688 Exp $
 */
public class ObjectInputOutputStream {
    public static void main(String[] args) throws IOException, ClassNotFoundException {
        File file = new File("E:/output.data");
        if (!file.exists()) {
            file.createNewFile();
        }

        //        FileOutputStream fileOutputStream = new FileOutputStream(file);
        //
        //                        ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);
        //
        //                        Date currentDate = new Date();
        //                        System.out.println(currentDate);
        //
        //                        objectOutputStream.writeObject(new Date());
        //
        //                        objectOutputStream.close();

        FileInputStream fileInputStream = new FileInputStream(file);

        ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);

        Date date = (Date) objectInputStream.readObject();

        System.out.println(date.getTime());

        System.out.println(date);
    }
}