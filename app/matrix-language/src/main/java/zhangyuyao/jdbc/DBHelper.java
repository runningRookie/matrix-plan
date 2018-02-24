package zhangyuyao.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class DBHelper{
    //数据库连接字符串
    private static final String url = "jdbc:mysql://localhost/test";
    //驱动程序类
    private static final String driver = "com.mysql.jdbc.Driver";
    //用户名
    private static final String user = "root";
    //密码
    private static final String password = "225821";
    //连接对象
    private Connection conn = null;
    //预处理语句
    public PreparedStatement pst = null;

    /**
     * 带参构造函数
     *
     * @param sql
     */
    public DBHelper(String sql){
        try {
            //加载驱动程序类
            Class.forName(driver);
            //连接到数据库
            conn = DriverManager.getConnection(url, user, password);
            pst = conn.prepareStatement(sql);
        } catch (Exception e) {
            close();
            e.printStackTrace();
        }
    }

    /**
     * 释放资源
     */
    public void close(){
        if(pst != null){
            try {
                pst.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        if(conn != null){
            try {

                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
