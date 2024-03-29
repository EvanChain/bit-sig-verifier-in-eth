// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

library BitMessage{

    function _splitSignature(bytes memory signature) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "InvalidSignature"); 

        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
    }

    function recover(bytes32 keccakDigest, bytes memory signature, bool stringMessage) public pure returns(address){
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(signature);
        bytes32 digest = stringMessage? messageDigest(keccakDigest) : messageDigestFromBufferMessage(keccakDigest);
        return ecrecover(digest, v, r, s);
    }

    // message digest from message in string type
    function messageDigest(bytes32 keccakDigest) public pure returns(bytes32){
        return shasha256(_buildBtcMessage(keccakDigest));
    }

    // message digest from message in buffer type   
    function messageDigestFromBufferMessage(bytes32 keccakDigest) public pure returns(bytes32){
        // 0x20 is the length in bytes of hash,
        // enforced by the type signature above
        return shasha256(abi.encodePacked("\x18Bitcoin Signed Message:\n\x20", keccakDigest));
    }

    // Build bit message data from keccak digest
    function _buildBtcMessage(bytes32 keccakDigest) internal pure returns(bytes memory packedData){
        packedData = new bytes(90);
        assembly{
            // the length and bytes of prefix "Bitcoin Signed Message:\n", and the lenth of message 0x40
            // 0x18 426974636f696e205369676e6564204d6573736167653a0a 40 00000000000
            mstore(add(packedData, 0x20), 0x18426974636f696e205369676e6564204d6573736167653a0a40000000000000)
        }
        for(uint i; i < 32; ++i){
            assembly{
                //32(array length) + 26(prefix length)
                let index := add(add(packedData, 0x3a), mul(i, 2))
                let v := byte(i, keccakDigest)
                let l := shr(4, v)
                //convert digest to assicll code 0-9 and a-z
                switch gt(l, 0x9)
                case true {
                    mstore8(index, add(l, 0x57))
                }
                case false {
                    mstore8(index, add(l, 0x30))
                }
                

                let r := mod(v, 0x10)
                switch gt(r, 0x9)
                case true {
                    mstore8(add(index, 1), add(r, 0x57))
                }
                case false {
                    mstore8(add(index, 1), add(r, 0x30))
                }
            }
        }
        return packedData;
    }

    function shasha256(bytes memory data) internal pure returns(bytes32){
        return sha256(bytes.concat(sha256(data)));
    }
}
