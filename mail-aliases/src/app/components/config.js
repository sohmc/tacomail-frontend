import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

export function BuildInfo({ versionInfo }) {
  const [showBuildInfo, setShowBuildInfo] = useState(false);

  const handleShowBuildInfo = () => setShowBuildInfo(true);
  const handleCloseBuildInfo = () => setShowBuildInfo(false);

  return (
    <>
      <Button onClick={ () => handleShowBuildInfo() }>Show Version Info</Button>
      <Modal show={ showBuildInfo } onHide={ handleCloseBuildInfo }>
        <Modal.Header closeButton>
          <Modal.Title>tacomail v.{ versionInfo.version }</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-break text-center'>
          <p>Build ID: { Object.prototype.hasOwnProperty.call(versionInfo, 'build') ? versionInfo.build : 'not specified' }</p>
          <p>Commit: { Object.prototype.hasOwnProperty.call(versionInfo, 'commit') ? versionInfo.commit : 'not specified' }</p>
        </Modal.Body>
      </Modal>
    </>
  );
}
