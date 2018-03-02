/**
 * LY.com Inc.
 * Copyright (c) 2004-2018 All Rights Reserved.
 */
package mybatis;

import java.io.IOException;
import java.io.InputStream;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import com.google.gson.Gson;

import mybatis.mapper.BlogMapper;
import mybatis.object.Blog;

/**
 * 混合使用XML和配置文件
 *
 * @author zyy43688
 * @version $Id: MixingDemo.java, v 0.1 2018年3月2日 上午10:08:32 zyy43688 Exp $
 */
public class MixingDemo {
    public static void main(String[] args) throws IOException {
        // 配置文件载入
        String resource = "mybatis/MyBatisConfiguration.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);

        // 构建session工厂
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);

        // 打开会话
        SqlSession sqlSession = sqlSessionFactory.openSession();

        // 配置转换器类
        sqlSession.getConfiguration().addMapper(BlogMapper.class);

        /*通过配置文件执行SQL语句*/
        // 执行SQL语句
        Blog blog = sqlSession.selectOne("mybatis.example.BlogMapper.selectBlog", 1);
        // 输出结果
        System.out.println(new Gson().toJson(blog));

        /*通过转换器类定义的接口执行SQL语句*/
        // 执行SQL语句
        BlogMapper blogMapper = sqlSession.getMapper(BlogMapper.class);
        blog = blogMapper.getBlogById(1);
        System.out.println(new Gson().toJson(blog));
    }
}