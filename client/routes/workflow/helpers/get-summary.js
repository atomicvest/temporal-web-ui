import getSummaryWorkflowStatus from './get-summary-workflow-status';
import parentWorkflowLink from './parent-workflow-link';
import { getKeyValuePairs, timestampToDate } from '~helpers';

const getSummary = ({ events, isWorkflowRunning, workflow }) => {
  // For displaying pending activities.
  const formattedWorkflow = workflow.pendingActivities
    ? {
        ...workflow,
        pendingActivities: workflow.pendingActivities.map(pendingActivity => ({
          ...pendingActivity,
          kvps: getKeyValuePairs(pendingActivity),
        })),
      }
    : workflow;

  // For displaying pending child workflows.
  if (workflow.pendingChildren) {
    formattedWorkflow.pendingChildren = formattedWorkflow.pendingChildren || {};
    formattedWorkflow.pendingChildren.kvps = workflow.pendingChildren.map(pendingChild => ({
      key: pendingChild.runId,
      value: pendingChild.workflowId,
      routeLink: {
        name: 'workflow/summary',
        params: {
          workflowId: pendingChild.workflowId,
          runId: pendingChild.runId,
        },
      },
    }))
  }

  if (formattedWorkflow.workflowExecutionInfo) {
    const { workflowExecutionInfo } = formattedWorkflow;

    formattedWorkflow.workflowExecutionInfo = {
      ...workflowExecutionInfo,
      startTime: timestampToDate(workflowExecutionInfo.startTime),
      closeTime: timestampToDate(workflowExecutionInfo.closeTime),
    };
  }

  if (!events || !events.length) {
    return {
      input: undefined,
      isWorkflowRunning,
      parentWorkflowRoute: undefined,
      result: undefined,
      wfStatus: undefined,
      workflow: formattedWorkflow,
    };
  }

  const firstEvent = events[0];
  const lastEvent = events.length > 1 && events[events.length - 1];

  const input = firstEvent.details.input?.payloads;

  const workflowCompletedEvent =
    lastEvent && lastEvent.eventType.startsWith('WorkflowExecution')
      ? lastEvent
      : undefined;

  const result = workflowCompletedEvent
    ? workflowCompletedEvent.details.result?.payloads ??
      workflowCompletedEvent.details
    : undefined;

  const wfStatus = getSummaryWorkflowStatus({
    isWorkflowRunning,
    workflow,
    workflowCompletedEvent,
  });

  const parentWorkflowRoute = parentWorkflowLink(firstEvent.details);

  return {
    input,
    isWorkflowRunning,
    parentWorkflowRoute,
    result,
    wfStatus,
    workflow: formattedWorkflow,
  };
};

export default getSummary;
