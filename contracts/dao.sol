// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract DAO {
    function nativeToken() virtual public view returns (address);
    function newProposal(
        bytes memory _proposalData,
        string memory _description,
        address _recipient,
        IERC20 _token
    ) virtual public returns (uint256);
    function vote(uint256 _proposalId, bool _supportsProposal) virtual public;
    function executeProposal(uint256 _proposalId) virtual public;
}

contract WorkValidation is Ownable {
    address public employer;
    address public employee;
    uint256 public reward;
    uint256 public deadline;
    string public taskDescription;
    bool public completed;
    bool public cancelled;
    string public work;
    string public criteria;
    DAO public dao;
    uint256 public proposalId;

    constructor(address _employee, uint256 _reward, uint256 _deadline, string memory _taskDescription) payable {
        employer = msg.sender;
        employee = _employee;
        reward = _reward;
        deadline = _deadline;
        taskDescription = _taskDescription;
        completed = false;
        cancelled = false;
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        super.transferOwnership(newOwner);
    }
    function setDAO(address _daoAddress) public onlyOwner {
        dao = DAO(_daoAddress);
    }

    function activateTask(uint256 _reward, string memory _criteria) public payable {
        reward = _reward;
        criteria = _criteria;
        require(msg.value == _reward, "Amount sent must be equal to the reward");
    }

    function completeTask(string memory _work) public {
        require(msg.sender == employee, "Only the employee can complete the task");
        require(block.timestamp <= deadline, "Deadline has passed");
        require(!cancelled, "Task has been cancelled");
        require(bytes(work).length == 0, "Task is already marked as completed");

        work = _work;
        bytes memory data = abi.encodeWithSignature("verifyTask()");
        string memory description = "Verify task completion";
        IERC20 token = IERC20(dao.nativeToken());
        address recipient = address(this);
        proposalId = dao.newProposal(data, description, recipient, token);
    }

    function verifyTask() public {
        require(msg.sender == address(dao), "Only the DAO can verify the task");
        require(bytes(work).length > 0, "No work has been submitted yet");

        // perform task verification
        bool isVerified = true;

        if (isVerified) {
            completed = true;
            dao.vote(proposalId, true);
            dao.executeProposal(proposalId);
            payable(employee).transfer(reward);
        } else {
            dao.vote(proposalId, false);
        }
    }

    function cancelTask() public {
        require(msg.sender == employee, "Only the employee can cancel the task");
        require(!completed, "Task has already been completed");

        cancelled = true;
        payable(employer).transfer(reward);
    }

    function getWork() public view returns (string memory) {
        return work;
    }

    function getCriteria() public view returns (string memory) {
        return criteria;
    }

    function voteOnCompletion(bool _supportsProposal) public {
        require(dao != DAO(address(0)), "DAO has not been set");
        dao.vote(proposalId, _supportsProposal);
    }
}