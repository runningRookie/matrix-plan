package zhangyuyao.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * 
 */
public class DBHelper {
    //连接对象
    private static Connection conn = null;
    //预处理语句
    private PreparedStatement pst  = null;

    /**
     * 带参构造函数
     *
     * @param sql
     */
    public DBHelper(String sql) {
        try {
            //加载驱动程序类
            Class.forName(DatabaseConfig.getDriver());
            //连接到数据库
            if (conn == null) {
                conn = DriverManager.getConnection(DatabaseConfig.getUrl(), DatabaseConfig.getUser(), DatabaseConfig.getPassword());
            }
            pst = conn.prepareStatement(sql);
        } catch (Exception e) {
            close();
            e.printStackTrace();
        }
    }

    /**
     * 释放资源
     */
    public void close() {
        if (pst != null) {
            try {
                pst.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        if (conn != null) {
            try {

                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 获取链接
     * 
     * @return
     */
    public Connection getConn() {
        return conn;
    }

    /**
     * 获取预处理语句
     * 
     * @return
     */
    public PreparedStatement getPst() {
        return pst;
    }
}
