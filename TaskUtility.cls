public with sharing class TaskUtility { 

    // 🔍 Search for accounts by name (case-insensitive, partial match)
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchKey) {
        if (String.isBlank(searchKey)) {
            return new List<Account>();
        }

        try {
            return [
                SELECT Id, Name, Industry, Phone 
                FROM Account 
                WHERE Name LIKE :('%' + searchKey + '%') 
                ORDER BY Name 
                LIMIT 10
            ];
        } catch (Exception ex) {
            throw new AuraHandledException('Error searching accounts: ' + ex.getMessage());
        }
    }

    // 📦 Get a single account by Id
    @AuraEnabled(cacheable=true)
    public static Account getAccountById(Id accountId) {
        if (accountId == null) {
            throw new AuraHandledException('Account Id is required.');
        }

        try {
            return [
                SELECT Id, Name, Industry, Phone 
                FROM Account 
                WHERE Id = :accountId 
                LIMIT 1
            ];
        } catch (Exception ex) {
            throw new AuraHandledException('Error fetching account details: ' + ex.getMessage());
        }
    }

    // 📋 Fetch tasks related to an account
    @AuraEnabled(cacheable=true)
    public static List<Task> getTasksForAccount(Id accountId) {
        if (accountId == null) {
            return new List<Task>();
        }

        try {
            return [
                SELECT Id, Subject, Status, Priority, ActivityDate 
                FROM Task 
                WHERE WhatId = :accountId
                ORDER BY ActivityDate DESC
            ];
        } catch (Exception ex) {
            throw new AuraHandledException('Error retrieving tasks: ' + ex.getMessage());
        }
    }

    // 💾 Save or update a task record
    @AuraEnabled
    public static void saveTask(Task taskRecord) {
        if (taskRecord == null) {
            throw new AuraHandledException('Task record cannot be null.');
        }

        try {
            taskRecord.ownerid = userinfo.getuserid();
            upsert taskRecord;
        } catch (DmlException dmlEx) {
            throw new AuraHandledException('Failed to save task: ' + dmlEx.getMessage());
        }
    }

    // ❌ Delete a task by Id
    @AuraEnabled
    public static void deleteTask(Id taskId) {
        if (taskId == null) {
            throw new AuraHandledException('Task Id cannot be null.');
        }

        try {
            Task t = [SELECT Id FROM Task WHERE Id = :taskId LIMIT 1];
            delete t;
        } catch (Exception ex) {
            throw new AuraHandledException('Failed to delete task: ' + ex.getMessage());
        }
    }
}