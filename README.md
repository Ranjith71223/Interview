**AccountSearchComponent - Parent component**
(Sending account selected to child component using @api variables)

**Purpose**
  Search for Account
  View search results
  Select an account to view details
  Interact with a child component to create/read/update/delete (CRUD) Tasks for that account
  Display the total number of tasks

**TaskCRUDChildComponent - Child component**
(After insert and deletion - send count of tasks to the parent component using Custom events)
(For refresh of task datatable - refreshapex module is used)

**Purpose**
  Displays all Tasks related to a selected Account.
  Shows them in a Lightning Datatable.
  Allows creating or editing tasks via a modal dialog.
