/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.jdbc;

import java.io.IOException;
import java.util.Properties;

/**
 * 数据库配置
 *
 * @author zyy43688
 * @version $Id: DatabaseConfig.java, v 0.1 2018年2月24日 下午2:08:47 zyy43688 Exp $
 */
public class DatabaseConfig {
    /**
     * 配置文件路径
     */
    private static final String CONFIG_FILE_PATH = "/databaseConnection.properties";

    /**
     * 链接URL
     */
    private static String       url;

    /**
     * 驱动类完整限定名
     */
    private static String       driver;

    /**
     * 用户名
     */
    private static String       user;

    /**
     * 密码
     */
    private static String       password;

    static {
        Properties properties = new Properties();
        try {
            properties.load(DatabaseConfig.class.getResourceAsStream(CONFIG_FILE_PATH));

            // 初始化
            url = properties.getProperty("url");
            driver = properties.getProperty("driver");
            user = properties.getProperty("user");
            password = properties.getProperty("password");

        } catch (IOException e) {
            // 封装为运行时异常
            throw new RuntimeException(e);
        }
    }

    /**
     * 获取链接URL
     * @return 配置的链接URL
     */
    public static String getUrl() {
        return url;
    }

    /**
     * 获取完整的驱动程序类限定名
     * 
     * @return 完整的驱动程序类限定名
     */
    public static String getDriver() {
        return driver;
    }

    /**
     * 获取配置的用户名
     * 
     * @return 配置的用户名
     */
    public static String getUser() {
        return user;
    }

    /**
     * 获取配置的密码
     * 
     * @return 配置的密码
     */
    public static String getPassword() {
        return password;
    }
}