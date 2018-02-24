/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

/**
 * properties工具类
 *
 * @author zyy43688
 * @version $Id: PropertiesUtils.java, v 0.1 2018年2月24日 上午11:23:20 zyy43688 Exp $
 */
public class PropertiesUtils {
    public static void main(String[] args) throws IOException {

        FileInputStream fileInputStream = new FileInputStream("databaseConnection.properties");

        Properties properties = new Properties();

        properties.load(fileInputStream);

        for (String name: properties.stringPropertyNames()) {
            System.out.println(properties.getProperty(name));
        }

    }
}