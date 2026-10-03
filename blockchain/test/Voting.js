import assert from 'node:assert/strict'
import { network } from 'hardhat'

describe('Voting', function () {
  let voting
  let admin
  let voterOne
  let voterTwo
  let voterThree
  let outsider

  async function expectTransactionToFail(transactionPromise) {
    let failed = false

    try {
      const transaction = await transactionPromise
      await transaction.wait()
    } catch {
      failed = true
    }

    assert.equal(failed, true)
  }

  beforeEach(async function () {
    const { ethers } = await network.create()
    ;[admin, voterOne, voterTwo, voterThree, outsider] = await ethers.getSigners()
    voting = await ethers.deployContract('Voting')
    await voting.waitForDeployment()
  })

  it('sets the deployer as admin', async function () {
    assert.equal(await voting.admin(), admin.address)
  })

  it('allows the admin to register a voter', async function () {
    await voting.registerVoter(voterOne.address)

    assert.equal(await voting.registeredVoters(voterOne.address), true)
  })

  it('prevents a non-admin from registering a voter', async function () {
    await expectTransactionToFail(
      voting.connect(outsider).registerVoter(voterOne.address),
    )
  })

  it('allows the admin to register a candidate', async function () {
    await voting.registerCandidate('Ada')

    const candidates = await voting.getCandidates()
    assert.equal(candidates.length, 1)
    assert.equal(candidates[0].name, 'Ada')
    assert.equal(await voting.candidateExists(0), true)
  })

  it('prevents a non-admin from registering a candidate', async function () {
    await expectTransactionToFail(
      voting.connect(outsider).registerCandidate('Ada'),
    )
  })

  it('allows a registered voter to vote', async function () {
    await voting.registerVoter(voterOne.address)
    await voting.registerCandidate('Ada')
    await voting.connect(voterOne).vote(0)

    assert.equal(await voting.hasVoted(voterOne.address), true)
  })

  it('prevents an unregistered voter from voting', async function () {
    await voting.registerCandidate('Ada')

    await expectTransactionToFail(voting.connect(voterOne).vote(0))
  })

  it('prevents a voter from voting twice', async function () {
    await voting.registerVoter(voterOne.address)
    await voting.registerCandidate('Ada')
    await voting.connect(voterOne).vote(0)

    await expectTransactionToFail(voting.connect(voterOne).vote(0))
  })

  it('increments the selected candidate vote count', async function () {
    await voting.registerVoter(voterOne.address)
    await voting.registerCandidate('Ada')
    await voting.connect(voterOne).vote(0)

    assert.equal(await voting.getVoteCount(0), 1n)
  })

  it('prevents voting for a nonexistent candidate', async function () {
    await voting.registerVoter(voterOne.address)

    await expectTransactionToFail(voting.connect(voterOne).vote(99))
  })

  it('returns the full candidate list', async function () {
    await voting.registerCandidate('Ada')
    await voting.registerCandidate('Grace')

    const candidates = await voting.getCandidates()
    assert.equal(candidates.length, 2)
    assert.equal(candidates[0].name, 'Ada')
    assert.equal(candidates[1].name, 'Grace')
  })

  it('returns an empty candidate list before candidates are registered', async function () {
    const candidates = await voting.getCandidates()

    assert.equal(candidates.length, 0)
  })

  it('returns the first candidate with zero votes when no votes have been cast', async function () {
    await voting.registerCandidate('Ada')
    await voting.registerCandidate('Grace')

    const [winnerName, winnerVotes] = await voting.getWinner()
    assert.equal(winnerName, 'Ada')
    assert.equal(winnerVotes, 0n)
  })

  it('rejects reading a winner when no candidates are registered', async function () {
    await expectTransactionToFail(voting.getWinner())
  })

  it('returns the current winner and result', async function () {
    await voting.registerVoter(voterOne.address)
    await voting.registerVoter(voterTwo.address)
    await voting.registerCandidate('Ada')
    await voting.registerCandidate('Grace')
    await voting.connect(voterOne).vote(1)
    await voting.connect(voterTwo).vote(1)

    const [winnerName, winnerVotes] = await voting.getWinner()
    assert.equal(winnerName, 'Grace')
    assert.equal(winnerVotes, 2n)
  })

  it('keeps vote counts independent for multiple candidates', async function () {
    await voting.registerVoter(voterOne.address)
    await voting.registerVoter(voterTwo.address)
    await voting.registerVoter(voterThree.address)
    await voting.registerCandidate('Ada')
    await voting.registerCandidate('Grace')
    await voting.connect(voterOne).vote(0)
    await voting.connect(voterTwo).vote(1)
    await voting.connect(voterThree).vote(1)

    assert.equal(await voting.getVoteCount(0), 1n)
    assert.equal(await voting.getVoteCount(1), 2n)
  })

  it('allows multiple registered voters to vote for candidates', async function () {
    await voting.registerVoter(voterOne.address)
    await voting.registerVoter(voterTwo.address)
    await voting.registerCandidate('Ada')
    await voting.connect(voterOne).vote(0)
    await voting.connect(voterTwo).vote(0)

    assert.equal(await voting.hasVoted(voterOne.address), true)
    assert.equal(await voting.hasVoted(voterTwo.address), true)
    assert.equal(await voting.getVoteCount(0), 2n)
  })
})
