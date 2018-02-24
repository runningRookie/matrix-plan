/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package zhangyuyao.jdbc;

import java.io.UnsupportedEncodingException;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * JDBC实例
 *
 * @author zyy43688
 * @version $Id: JdbcDemo.java, v 0.1 2018年2月24日 上午9:50:45 zyy43688 Exp $
 */
public class JdbcDemo {
    public static void main(String[] args) {
        //从学生表当中获取信息
        DBHelper db = new DBHelper("select * from stu");
        ResultSet set;
        try {
            set = db.pst.executeQuery();
            while(set.next()){
                System.out.println(set.getString(1));
                System.out.println(set.getString(2));
                System.out.println(new String(set.getBytes(3), "gbk"));
                System.out.println(set.getString(4));
            }
            db.close();
        } catch (SQLException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }
}

