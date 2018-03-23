/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.classlodaer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/**
 * @author zyy43688
 * @version $Id: NetworkClassLoader.java, v 0.1 2018年3月16日 下午4:41:39 zyy43688 Exp $
 */
public class NetworkClassLoader extends ClassLoader {
    private String rootUrl;

    /**
     *
     * @param rootUrl
     */
    public NetworkClassLoader(String rootUrl) {
        this.rootUrl = rootUrl;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        Class clazz;
        byte[] classData = getClassData(name);

        if (classData == null) {
            throw new ClassNotFoundException();
        }
        clazz = defineClass(name, classData, 0, classData.length);
        return clazz;
    }

    private byte[] getClassData(String name) {
        InputStream is = null;
        try {
            String path = classNameToPath(name);
            URL url = new URL(path);
            byte[] buff = new byte[1024 * 4];
            is = url.openStream();
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            int len;
            while ((len = is.read(buff)) != -1) {
                byteArrayOutputStream.write(buff, 0, len);
            }
            return byteArrayOutputStream.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return null;
    }

    private String classNameToPath(String name) {
        return rootUrl + "/" + name.replace(".", "/") + ".class";
    }
}