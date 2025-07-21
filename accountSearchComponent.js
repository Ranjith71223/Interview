import { LightningElement, track } from 'lwc';

// Apex methods to search and fetch accounts
import searchAccounts from '@salesforce/apex/TaskUtility.searchAccounts';
import getAccountById from '@salesforce/apex/TaskUtility.getAccountById';

export default class AccountSearchComponent extends LightningElement {
    // Search input value
    searchKey = '';

    EmptySearch = false;

    // Holds the list of matching accounts from search
    @track accounts;

    // Holds the selected account details
    @track selectedAccount;

    // Holds the total number of tasks received from child component
    @track taskCount;

    // Event handler to receive task count from child component
    handleTaskCount(event) {
        this.taskCount = event.detail.count;
    }

    // Handles input changes in the search box
    // Initiates account search when input length >= 2
    handleSearch(event) {
        this.searchKey = event.target.value;

        // Start search only if user types at least 2 characters
        if (this.searchKey.length >= 2) {
            searchAccounts({ searchKey: this.searchKey })
                .then(result => {
                    this.accounts = result;
                    if(this.accounts.length == 0){
                        this.EmptySearch = true;
                    }else{
                        this.EmptySearch = false;
                    }
                })
                .catch(error => {
                    console.error('Error fetching accounts:', error);
                });
        }
    }

    // Handles click on an account name from the search result list
    // Fetches full account details by Id
    handleAccountSelect(event) {
        const accountId = event.target.dataset.id;

        getAccountById({ accountId })
            .then(result => {
                this.selectedAccount = result;

                // Clear search results after selecting an account
                this.accounts = null;
            })
            .catch(error => {
                console.error('Error fetching account details:', error);
            });
    }
}
