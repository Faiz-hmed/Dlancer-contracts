// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DaoTaskContract {
    address public employer;
    address public employee;
    uint256 public reward;
    uint256 public deadline;
    string public taskDescription;
    string public criteria;
    bool public completed;
    bool public cancelled;
    bool public verified;
    address public daoAddress;
    uint256 public proposalId;
    string public submittedCode;

    constructor(address _employee, uint256 _reward, uint256 _deadline, string memory _taskDescription, string memory _criteria, address _daoAddress)  public payable{
        employer = msg.sender;
        employee = _employee;
        reward = _reward;
        deadline = _deadline;
        taskDescription = _taskDescription;
        criteria = _criteria;
        daoAddress = _daoAddress;
        completed = false;
        cancelled = false;
        verified = false;
    }

    function activateTask(uint256 _reward) public payable {
        reward = _reward;
        require(msg.value == _reward, "Amount sent must be equal to the reward");
    }

    function completeTask(string memory _submittedCode) public {
        // require(msg.sender == employee, "Only the employee can complete the task");
        require(block.timestamp <= deadline, "Deadline has passed");
        require(!cancelled, "Task has been cancelled");

        completed = true;
        submittedCode = _submittedCode;
        
        // Create a proposal on the DAO for the members to vote on the task verification
         bytes memory proposalData = abi.encodeWithSignature("verifyTask(string)", criteria);
        DAO dao = DAO(daoAddress);
        proposalId = dao.newProposal(
            proposalData,
            "Verify task completion",
            address(this),
            reward
        );
    }
    


    function cancelTask() public {
        require(msg.sender == employee, "Only the employee can cancel the task");
        require(!completed, "Task has already been completed");

        cancelled = true;
        payable(employer).transfer(reward);
    }

function executeProposal(uint256 _proposalId, string calldata _code) public {
        DAO dao = DAO(daoAddress);
        (uint256 votes, uint256 max) = dao.getVoteResults(_proposalId);
        require(votes > max / 2, "Proposal did not pass");

        require(keccak256(bytes(_code)) == keccak256(bytes(criteria)), "Code did not match criteria");

        verified = true;
        payable(employee).transfer(reward);
    }
}

interface DAO {
    function newProposal(
        bytes calldata proposalData,
        string calldata description,
        address applicant,
        uint256 weiAmount
    ) external returns (uint256);

    function nativeToken() external view returns (address);

    function getVoteResults(uint256 proposalId) external view returns (uint256, uint256);
}



// pragma solidity 0.8.8;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// contract DaoTaskContract {
//     address public employer;
//     address public employee;
//     uint256 public reward;
//     uint256 public deadline;
//     string public taskDescription;
//     string public criteria;
//     bool public completed;
//     bool public cancelled;
//     bool public verified;
//     address public daoAddress;
//     uint256 public proposalId;

//     constructor(address _employee, uint256 _reward, uint256 _deadline, string memory _taskDescription, string memory _criteria, address _daoAddress)  public payable{
//         employer = msg.sender;
//         employee = _employee;
//         reward = _reward;
//         deadline = _deadline;
//         taskDescription = _taskDescription;
//         criteria = _criteria;
//         daoAddress = _daoAddress;
//         completed = false;
//         cancelled = false;
//         verified = false;
//     }

//     function activateTask(uint256 _reward) public payable {
//         reward = _reward;
//         require(msg.value == _reward, "Amount sent must be equal to the reward");
//     }

//     function completeTask() public {
//         require(msg.sender == employee, "Only the employee can complete the task");
//         require(block.timestamp <= deadline, "Deadline has passed");
//         require(!cancelled, "Task has been cancelled");

//         completed = true;
//     }

//     function verifyTask() public {
//         require(msg.sender == employer, "Only the employer can verify the task");
//         require(completed, "Task has not been completed yet");

//         // Create a proposal on the DAO for the members to vote on the task verification
//         bytes memory proposalData = abi.encodeWithSignature("verifyTask()");
//         DAO dao = DAO(daoAddress);
//         proposalId = dao.newProposal(
//             proposalData,
//             "Verify task completion",
//             address(this),
//             IERC20(dao.nativeToken())
//         );
//     }

//     function cancelTask() public {
//         require(msg.sender == employee, "Only the employee can cancel the task");
//         require(!completed, "Task has already been completed");

//         cancelled = true;
//         payable(employer).transfer(reward);
//     }

//     function executeProposal() public {
//         DAO dao = DAO(daoAddress);
//         (uint256 votes, uint256 max) = dao.getVoteResults(proposalId);
//         require(votes > max / 2, "Proposal did not pass");

//         verified = true;
//         payable(employee).transfer(reward);
//     }
// }

// interface DAO {
//     function newProposal(
//         bytes calldata _proposalData,
//         string calldata _description,
//         address _applicant,
//         IERC20 _token
//     ) external returns (uint256);

//     function nativeToken() external view returns (address);

//     function getVoteResults(uint256 _proposalId) external view returns (uint256, uint256);
// }