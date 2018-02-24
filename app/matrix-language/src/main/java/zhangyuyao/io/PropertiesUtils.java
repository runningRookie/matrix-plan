/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.io;

import java.io.IOException;
import java.net.URL;
import java.util.Properties;

/**
 * properties工具类
 *
 * @author zyy43688
 * @version $Id: PropertiesUtils.java, v 0.1 2018年2月24日 上午11:23:20 zyy43688 Exp $
 */
public class PropertiesUtils {

    public static void main(String[] args) throws IOException {

        URL url = PropertiesUtils.class.getResource("/databaseConnection.properties");

        System.out.println(url.getPath());

        Properties properties = new Properties();

        properties.load(PropertiesUtils.class.getResourceAsStream("/databaseConnection.properties"));

        for (String name : properties.stringPropertyNames()) {
            System.out.println(properties.getProperty(name));
        }
    }
}