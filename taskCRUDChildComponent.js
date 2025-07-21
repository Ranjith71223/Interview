import { LightningElement, api, track, wire } from 'lwc';

// Apex methods for task operations
import getTasksForAccount from '@salesforce/apex/TaskUtility.getTasksForAccount';
import saveTask from '@salesforce/apex/TaskUtility.saveTask';
import deleteTask from '@salesforce/apex/TaskUtility.deleteTask';

// Utility to refresh wired data
import { refreshApex } from '@salesforce/apex';

export default class TaskCRUDChildComponent extends LightningElement {
    // Public property to receive Account Id from parent component
    @api accountId;

    // Tracked property to store task list
    @track tasks;

    // Modal visibility toggle
    @track showModal = false;

    // Object to hold task data being created or edited
    @track taskRecord = {};

    // Title displayed on the modal (New Task / Edit Task)
    modalTitle = 'New Task';

    // Columns definition for lightning-datatable
    columns = [
        { label: 'Subject', fieldName: 'Subject' },
        { label: 'Status', fieldName: 'Status' },
        { label: 'Priority', fieldName: 'Priority' },
        { label: 'Due Date', fieldName: 'ActivityDate', type: 'date' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Holds reference to the wired Apex result for refreshApex usage
    ApexResult;

    // Wire method to fetch tasks for the selected account
    @wire(getTasksForAccount, { accountId: '$accountId' })
    wiredTasks(result) {
        // Store wire result to use with refreshApex
        this.ApexResult = result;

        if (result.data) {
            this.tasks = result.data;
            this.error = undefined;

            // Fire a custom event to send task count to parent
            this.dispatchEvent(new CustomEvent('taskcount', {
                detail: { count: result.data.length }
            }));
        } else if (result.error) {
            this.error = result.error;
            this.tasks = [];
        }
    }

    statusOptions = [
    { label: 'Not Started', value: 'Not Started' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Waiting on someone else', value: 'Waiting on someone else' },
    { label: 'Deferred', value: 'Deferred' }
];

// Use this if handling picklists separately
handlePicklistChange(event) {
    const field = event.target.dataset.field;
    this.taskRecord[field] = event.detail.value;
}

    // Opens the modal for creating a new task
    handleNewTask() {
        this.taskRecord = { WhatId: this.accountId }; // Assign parent account ID
        this.modalTitle = 'New Task';
        this.showModal = true;
    }

    // Handles edit or delete actions from the datatable row
    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        if (action === 'edit') {
            // Clone row data into taskRecord and open modal
            this.taskRecord = { ...row };
            this.modalTitle = 'Edit Task';
            this.showModal = true;
        } else if (action === 'delete') {
            // Delete selected task
            deleteTask({ taskId: row.Id })
                .then(() => {refreshApex(this.ApexResult);
                    this.dispatchEvent(new CustomEvent('taskcount', {
                    detail: { count: result.length }
                }));
                }) // Refresh manually after delete
                .catch(err => console.error(err));
        }
    }

    // Handles input field changes and updates taskRecord accordingly
    handleInputChange(event) {
        this.taskRecord[event.target.dataset.field] = event.target.value;
    }

    // Closes the modal without saving
    handleCancel() {
        this.showModal = false;
    }

    // Saves new or updated task to the server
    handleSave() {
        this.taskRecord.WhatId = this.accountId; // Associate task with account
        saveTask({ taskRecord: this.taskRecord })
            .then(() => {
                this.showModal = false;

                // Refresh the task list using refreshApex
                refreshApex(this.ApexResult);
            })
            .catch(error => console.error(error));
    }

    // Manual refresh method used after delete (not needed if only using @wire + refreshApex)
    refreshTasks() {
        console.log('inside refresh task');
        getTasksForAccount({ accountId: this.accountId })
            .then(result => {
                console.log('inside refresh task2', JSON.stringify(result));
                this.tasks = result;

                // Re-fire task count event after manual refresh
                this.dispatchEvent(new CustomEvent('taskcount', {
                    detail: { count: result.length }
                }));
            })
            .catch(err => console.error(err));
    }
}