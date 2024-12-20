import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { enzymesInRestrictionEnzymeDigestionSource } from '../../utils/sourceFunctions';

// TODO refactor this to use common part

function EuroscarfMessage({ source }) {
  const { repository_id: repositoryId } = source;
  return (
    <>
      Plasmid
      {' '}
      <strong>
        <a href={`http://www.euroscarf.de/plasmid_details.php?accno=${repositoryId}`} target="_blank" rel="noopener noreferrer">
          {repositoryId}
        </a>
      </strong>
      {' '}
      from Euroscarf
    </>
  );
}

function BenchlingMessage({ source }) {
  const { repository_id: repositoryId } = source;
  const editUrl = repositoryId.replace(/\.gb$/, '/edit');
  return (
    <>
      Request to Benchling (
      <strong>
        <a href={editUrl} target="_blank" rel="noopener noreferrer">
          link
        </a>
      </strong>
      )
    </>
  );
}

function SnapGenePlasmidMessage({ source }) {
  const { repository_id: repositoryId } = source;
  const [plasmidSet, plasmidName] = repositoryId.split('/');
  return (
    <>
      Plasmid
      {' '}
      <strong>
        <a href={`https://www.snapgene.com/plasmids/${plasmidSet}/${plasmidName}`} target="_blank" rel="noopener noreferrer">
          {plasmidName}
        </a>
      </strong>
      {' '}
      from SnapGene
    </>
  );
}

function RepositoryIdMessage({ source }) {
  const { repository_name: repositoryName } = source;
  let url = '';
  if (repositoryName === 'genbank') {
    url = `https://www.ncbi.nlm.nih.gov/nuccore/${source.repository_id}`;
  } else if (repositoryName === 'addgene') {
    url = `https://www.addgene.org/${source.repository_id}/sequences/`;
  }
  return (
    <>
      {`Request to ${repositoryName} with ID `}
      <strong>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {source.repository_id}
          {' '}
        </a>
      </strong>
    </>
  );
}

function GatewayMessage({ source }) {
  return (
    <>
      Gateway
      {' '}
      {source.reaction_type}
      {' '}
      reaction
    </>
  );
}

function FinishedSource({ sourceId }) {
  const source = useSelector((state) => state.cloning.sources.find((s) => s.id === sourceId), shallowEqual);
  const primers = useSelector((state) => state.cloning.primers, shallowEqual);
  let message = '';
  switch (source.type) {
    case 'UploadedFileSource': message = `Read from uploaded file ${source.file_name}`; break;
    case 'ManuallyTypedSource': message = 'Manually typed sequence'; break;
    case 'LigationSource': message = (source.input.length === 1) ? 'Circularization of fragment' : 'Ligation of fragments'; break;
    case 'GibsonAssemblySource': message = 'Gibson assembly of fragments'; break;
    case 'OverlapExtensionPCRLigationSource': message = 'Overlap extension PCR ligation'; break;
    case 'RestrictionEnzymeDigestionSource': {
      const uniqueEnzymes = enzymesInRestrictionEnzymeDigestionSource(source);
      message = `Restriction with ${uniqueEnzymes.join(' and ')}`;
    }
      break;
    case 'RestrictionAndLigationSource': {
      const uniqueEnzymes = [...new Set(source.restriction_enzymes)];
      uniqueEnzymes.sort();
      message = `Restriction with ${uniqueEnzymes.join(' and ')}, then ligation`;
    }
      break;
    case 'PCRSource':
      {
        const [fwdPrimer, rvsPrimer] = [source.assembly[0].sequence, source.assembly[2].sequence];
        message = `PCR with primers ${primers.find((p) => fwdPrimer === p.id).name} and ${primers.find((p) => rvsPrimer === p.id).name}`;
      }

      break;
    case 'OligoHybridizationSource':
      message = `Hybridization of primers ${primers.find((p) => source.forward_oligo === p.id).name} and ${primers.find((p) => source.reverse_oligo === p.id).name}`;
      break;
    case 'HomologousRecombinationSource': message = `Homologous recombination with ${source.input[0]} as template and ${source.input[1]} as insert.`; break;
    case 'CRISPRSource': {
      const guidesString = source.guides.map((id) => primers.find((p) => id === p.id).name).join(', ');
      message = `CRISPR HDR with ${source.input[0]} as template, ${source.input[1]} as insert and ${guidesString} as a guide${source.guides.length > 1 ? 's' : ''}`;
    }
      break;
    case 'RepositoryIdSource': message = <RepositoryIdMessage source={source} />;
      break;
    case 'AddGeneIdSource': message = <RepositoryIdMessage source={source} />;
      break;
    case 'BenchlingUrlSource': message = <BenchlingMessage source={source} />;
      break;
    case 'EuroscarfSource': message = <EuroscarfMessage source={source} />;
      break;
    case 'SnapGenePlasmidSource': message = <SnapGenePlasmidMessage source={source} />;
      break;
    case 'GatewaySource': message = <GatewayMessage source={source} />;
      break;
    case 'GenomeCoordinatesSource':
      message = (
        <>
          <h4 style={{ marginBottom: '5px' }}>Genome region</h4>
          {source.assembly_accession && (
          <div>
            <strong>Assembly:</strong>
            {' '}
            <a href={`https://www.ncbi.nlm.nih.gov/datasets/genome/${source.assembly_accession}`} target="_blank" rel="noopener noreferrer">{source.assembly_accession}</a>
          </div>
          )}
          <div>
            <strong>Coords:</strong>
            {' '}
            <a href={`https://www.ncbi.nlm.nih.gov/nuccore/${source.sequence_accession}`} target="_blank" rel="noopener noreferrer">{source.sequence_accession}</a>
            {`(${source.start}:${source.end}, ${source.strand})`}
          </div>
          {source.locus_tag && (
          <div>
            <strong>Locus tag:</strong>
            {' '}
            {source.locus_tag}
          </div>
          )}
          {source.gene_id && (
          <div>
            <strong>Gene ID:</strong>
            {' '}
            <a href={`https://www.ncbi.nlm.nih.gov/gene/${source.gene_id}`} target="_blank" rel="noopener noreferrer">
              {source.gene_id}
            </a>
          </div>
          )}

        </>
      );
      break;
    case 'PolymeraseExtensionSource': message = 'Polymerase extension'; break;
    case 'ELabFTWFileSource':
      message = (
        <>
          Read from file
          {' '}
          <a target="_blank" rel="noopener noreferrer" href={`https://elab.local:3148/database.php?mode=view&id=${source.item_id}`}>{source.file_name}</a>
          {' '}
          from eLabFTW
        </>
      );
      break;
    default: message = '';
  }
  return (
    <div className="finished-source">{message}</div>
  );
}

export default React.memo(FinishedSource);
