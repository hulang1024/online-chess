package io.github.hulang1024.chinesechessserver.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.baomidou.mybatisplus.core.parser.ISqlParser;
import com.baomidou.mybatisplus.extension.parsers.DynamicTableNameParser;
import com.baomidou.mybatisplus.extension.parsers.ITableNameHandler;
import com.baomidou.mybatisplus.extension.plugins.PaginationInterceptor;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author YuLun
 * @description
 * @date 2020/9/4
 */
@EnableTransactionManagement(proxyTargetClass = true)
@Configuration
public class MyBatisPlusConfig {


    public static ThreadLocal<String> myTableName = new ThreadLocal<String>();

    /**
     * 分页插件
     *
     * @return
     */

    @Bean
    public PaginationInterceptor paginationInterceptor() {
        PaginationInterceptor paginationInterceptor = new PaginationInterceptor();

        /*动态表名*/
        List<ISqlParser> sqlParserList = new ArrayList<ISqlParser>();
        DynamicTableNameParser dynamicTableNameParser = new DynamicTableNameParser();
        Map<String, ITableNameHandler> tableNameHandlerMap = new HashMap<String, ITableNameHandler>(16);
        //trade是数据库表名
        tableNameHandlerMap.put("t_tmp_trade", new ITableNameHandler() {
            @Override
            public String dynamicTableName(MetaObject metaObject, String sql, String tableName) {
                return myTableName.get();//返回null不会替换 注意 多租户过滤会将它一块过滤不会替换@SqlParser(filter=true) 可不会替换
            }
        });

        //trade是数据库表名
        tableNameHandlerMap.put("t_finance_report", new ITableNameHandler() {
            @Override
            public String dynamicTableName(MetaObject metaObject, String sql, String tableName) {
                return myTableName.get();//返回null不会替换 注意 多租户过滤会将它一块过滤不会替换@SqlParser(filter=true) 可不会替换
            }
        });

        dynamicTableNameParser.setTableNameHandlerMap(tableNameHandlerMap);
        sqlParserList.add(dynamicTableNameParser);
        paginationInterceptor.setSqlParserList(sqlParserList);

        return paginationInterceptor;


    }

    /**
     * 设置创建时间和更新时间
     * 使用注解@TableField(fill = FieldFill.INSERT)即可，需要手动set这两个字段
     * update by YuLun on 2020/9/9
     *
     * @return
     */
    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MetaObjectHandler() {
            @Override
            public void insertFill(MetaObject metaObject) {
                LocalDateTime localDateTime = LocalDateTime.now();
                this.setInsertFieldValByName("createTime", localDateTime, metaObject);
                this.setInsertFieldValByName("updateTime", localDateTime, metaObject);
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                LocalDateTime localDateTime = LocalDateTime.now();
                this.setUpdateFieldValByName("updateTime", localDateTime, metaObject);
            }

        };
    }

}
