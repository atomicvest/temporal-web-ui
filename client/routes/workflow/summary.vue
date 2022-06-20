<template>
  <section class="workflow-summary" data-cy="summary">
    <aside class="actions">
      <feature-flag name="workflow-signal">
        <a
          href=""
          class="signal"
          v-show="showSignal"
          @click.prevent="$modal.show('send-signal')"
          data-cy="open-signal-dialog"
        >
          Signal
        </a>
      </feature-flag>

      <feature-flag name="workflow-terminate">
        <a
          href=""
          class="terminate"
          v-show="showTerminate"
          @click.prevent="$modal.show('confirm-termination')"
          data-cy="open-terminate-dialog"
        >
          Terminate
        </a>
      </feature-flag>

      <feature-flag name="workflow-restart">
        <a
          href=""
          class="restart"
          v-show="showRestart"
          @click.prevent="$modal.show('confirm-restart')"
          data-cy="open-restart-dialog"
        >
          Restart
        </a>
      </feature-flag>
    </aside>

    <modal name="send-signal">
      <h3>Are you sure you want to signal this workflow?</h3>
      <div class="checkbox">
        <p-check name="success" color="primary" v-model="signalSuccess">
          Success
        </p-check>
      </div>
      <input
        v-model="signalStatus"
        placeholder="Status"
        data-cy="signal-status"
      />
      <input
        v-model="signalMetadata"
        placeholder="Metadata"
        data-cy="signal-metadata"
      />
      <footer>
        <a
          href="#"
          class="send-signal"
          @click.prevent="sendSignal"
          data-cy="send-signal"
        >
          Send
        </a>
        <a
          href="#"
          class="cancel"
          @click.prevent="$modal.hide('send-signal')"
        >
          Cancel
        </a>
      </footer>
    </modal>

    <modal name="confirm-termination">
      <h3>Are you sure you want to terminate this workflow?</h3>
      <input
        v-model="terminationReason"
        placeholder="Reason"
        data-cy="termination-reason"
      />
      <footer>
        <a
          href="#"
          class="terminate"
          @click.prevent="terminate"
          data-cy="confirm-termination"
        >
          Terminate
        </a>
        <a
          href="#"
          class="cancel"
          @click.prevent="$modal.hide('confirm-termination')"
        >
          Cancel
        </a>
      </footer>
    </modal>

    <modal name="confirm-restart">
      <h3>Are you sure you want to restart this workflow with the same parameters?</h3>
      <p>This will terminate the existing open workflow run, if any.</p>
      <div class="checkbox">
        <p-check name="reapplySignals" color="primary" v-model="reapplySignals">
          Reapply signals
        </p-check>
      </div>
      <footer>
        <a
          href="#"
          class="restart"
          @click.prevent="restart"
          data-cy="confirm-restart"
        >
          Restart
        </a>
        <a
          href="#"
          class="cancel"
          @click.prevent="$modal.hide('confirm-restart')"
        >
          Cancel
        </a>
      </footer>
    </modal>

    <dl v-if="workflow">
      <div v-if="workflow.workflowExecutionInfo.isArchived">
        <h5>Workflow archived</h5>
        <p>
          This workflow has been retrieved from archival. Some summary
          information may be missing.
        </p>
      </div>
      <div class="workflow-name" data-cy="workflow-name">
        <dt>Workflow Name</dt>
        <dd>{{ workflow.workflowExecutionInfo.type.name }}</dd>
      </div>
      <div class="started-at" data-cy="started-at">
        <dt>Started At</dt>
        <dd>{{ workflowStartTime }}</dd>
      </div>
      <div class="close-time" v-if="workflowCloseTime" data-cy="closed-at">
        <dt>Closed Time</dt>
        <dd>{{ workflowCloseTime }}</dd>
      </div>
      <div
        class="workflow-status"
        :data-status="
          wfStatus !== undefined &&
            (typeof wfStatus === 'string' ? wfStatus : wfStatus.status)
        "
        data-cy="workflow-status"
      >
        <dt>Status</dt>
        <dd>
          <bar-loader v-if="wfStatus === 'running'" />
          <span v-if="typeof wfStatus === 'string'">{{ wfStatus }}</span>
          <span v-if="wfStatus !== undefined && wfStatus.next">
            {{ wfStatus.text }}
            <router-link :to="wfStatus.next">(next)</router-link>
          </span>
        </dd>
      </div>
      <div class="workflow-id" data-cy="workflow-id">
        <dt>Workflow Id</dt>
        <dd>{{ workflowId }}</dd>
      </div>
      <div class="run-id" data-cy="run-id">
        <dt>Run Id</dt>
        <dd>{{ runId }}</dd>
      </div>
      <div class="workflow-input" data-cy="workflow-input">
        <dt>Input</dt>
        <dd>
          <data-viewer
            v-if="input !== undefined"
            :item="input"
            :title="workflowId + ' Input'"
            :maxLines="10"
          />
        </dd>
      </div>
      <div class="workflow-result" v-if="resultView" data-cy="workflow-result">
        <dt>Result</dt>
        <dd>
          <data-viewer
            :item="resultView"
            :title="workflowId + ' Result'"
            :maxLines="10"
          />
        </dd>
      </div>
      <div
        class="parent-workflow"
        v-if="parentWorkflowRoute"
        data-cy="parent-workflow"
      >
        <dt>Parent Workflow</dt>
        <dd>
          <router-link :to="parentWorkflowRoute.to">
            {{ parentWorkflowRoute.text }}
          </router-link>
        </dd>
      </div>
      <div class="task-queue" data-cy="task-queue">
        <dt>Task Queue</dt>
        <dd>
          <router-link
            :to="{
              name: 'task-queue',
              params: {
                taskQueue: workflow.executionConfig.taskQueue.name,
              },
            }"
          >
            {{ workflow.executionConfig.taskQueue.name }}
          </router-link>
        </dd>
      </div>
      <div class="history-length" data-cy="history-length">
        <dt>History Events</dt>
        <dd>{{ workflow.workflowExecutionInfo.historyLength }}</dd>
      </div>
      <div data-cy="state-transitions">
        <dt>State Transitions</dt>
        <dd>{{ workflow.workflowExecutionInfo.stateTransitionCount }}</dd>
      </div>
      <div
        class="pending-activities"
        v-if="workflow.pendingActivities"
        data-cy="pending-activities"
      >
        <dt>Pending Activities</dt>
        <dd v-for="pa in workflow.pendingActivities" :key="pa.activityId">
          <detail-list :item="pa" />
        </dd>
      </div>
    </dl>
  </section>
</template>

<script>
import { TERMINATE_DEFAULT_ERROR_MESSAGE, SIGNAL_DEFAULT_ERROR_MESSAGE, RESTART_DEFAULT_ERROR_MESSAGE } from './constants';
import { NOTIFICATION_TYPE_ERROR, NOTIFICATION_TYPE_SUCCESS } from '~constants';
import { getErrorMessage } from '~helpers';
import { BarLoader, DataViewer, DetailList, FeatureFlag } from '~components';

export default {
  data() {
    return {
      signalSuccess: false,
      signalStatus: undefined,
      signalMetadata: undefined,
      terminationReason: undefined,
      webSettingsCache: undefined,
      reapplySignals: false,
    };
  },
  props: [
    'baseAPIURL',
    'input',
    'isWorkflowRunning',
    'parentWorkflowRoute',
    'result',
    'runId',
    'wfStatus',
    'workflow',
    'workflowId',
  ],
  components: {
    'bar-loader': BarLoader,
    'data-viewer': DataViewer,
    'detail-list': DetailList,
    'feature-flag': FeatureFlag,
  },
  created() {
    this.namespaceDescCache = {};
    this.getWebSettings();
  },
  computed: {
    workflowCloseTime() {
      return this.workflow.workflowExecutionInfo.closeTime
        ? this.workflow.workflowExecutionInfo.closeTime.format(
            'dddd MMMM Do, h:mm:ss a'
          )
        : '';
    },
    workflowStartTime() {
      return this.workflow.workflowExecutionInfo.startTime.format(
        'dddd MMMM Do, h:mm:ss a'
      );
    },
    resultView() {
      return this.result?.failure ? this.result?.failure : this.result;
    },
    showTerminate() {
      return this.isWorkflowRunning && this.webSettingsCache?.permitWriteApi;
    },
    showRestart() {
      return true // always show restart button (even for completed workflows)
    },
    showSignal() {
      return this.isWorkflowRunning &&
        this.webSettingsCache?.permitWriteApi &&
        (this.workflow?.workflowExecutionInfo?.searchAttributes?.WaitingForSignal ?? '') != ''
    }
  },
  methods: {
    sendSignal() {
      this.$modal.hide('send-signal');
      this.$http
        .post(`${this.baseAPIURL}/signal`, {
          signalName: this.workflow.workflowExecutionInfo.searchAttributes.WaitingForSignal,
          payload: {
            success: this.signalSuccess,
            status: this.signalStatus,
            metadata: this.signalMetadata,
          }
        })
        .then(
          r => {
            this.$emit('onNotification', {
              message: 'Workflow signalled.',
              type: NOTIFICATION_TYPE_SUCCESS,
            });
            // eslint-disable-next-line no-console
            console.dir(r);
          },
          error => {
            this.$emit('onNotification', {
              message: getErrorMessage(error, SIGNAL_DEFAULT_ERROR_MESSAGE),
              type: NOTIFICATION_TYPE_ERROR,
            });
          }
        );
    },
    terminate() {
      this.$modal.hide('confirm-termination');
      this.$http
        .post(`${this.baseAPIURL}/terminate`, {
          reason: this.terminationReason,
        })
        .then(
          r => {
            this.$emit('onNotification', {
              message: 'Workflow terminated.',
              type: NOTIFICATION_TYPE_SUCCESS,
            });
            // eslint-disable-next-line no-console
            console.dir(r);
          },
          error => {
            this.$emit('onNotification', {
              message: getErrorMessage(error, TERMINATE_DEFAULT_ERROR_MESSAGE),
              type: NOTIFICATION_TYPE_ERROR,
            });
          }
        );
    },
    restart() {
      this.$modal.hide('confirm-restart');
      this.$http
        .post(`${this.baseAPIURL}/restart`, {
          reapplySignals: reapplySignals,
        })
        .then(
          r => {
            this.$emit('onNotification', {
              message: 'Workflow restarted.',
              type: NOTIFICATION_TYPE_SUCCESS,
            });
            // eslint-disable-next-line no-console
            console.dir(r);
          },
          error => {
            this.$emit('onNotification', {
              message: getErrorMessage(error, RESTART_DEFAULT_ERROR_MESSAGE),
              type: NOTIFICATION_TYPE_ERROR,
            });
          }
        );
    },
    getWebSettings() {
      if (this.webSettingsCache) {
        return Promise.resolve(this.webSettingsCache);
      }

      return this.$http(`/api/web-settings`).then(r => {
        this.webSettingsCache = r;

        return this.webSettingsCache;
      });
    },
  },
};
</script>

<style lang="stylus">
@require "../../styles/definitions.styl"

section.workflow-summary
  overflow auto
  padding layout-spacing-small

  .pending-activities {
    dl.details {
      dd {
        white-space: normal;
      }
    }
  }

  dl:not(.details)
    & > div
      margin-bottom 1em
      & > dt
        text-transform uppercase
        font-size 11px
      dd, dt
        line-height 1.5em
  dl.details
    border 1px solid uber-black-60
    margin-bottom 1em
    dt
      padding 0 4px
  .run-id, .task-queue, .workflow-id, .workflow-name
    dd
      font-weight 300
      font-family monospace-font-family
  .workflow-status
    dd
      text-transform none
      a
        text-transform none
    &[data-status="completed"] dd
      color uber-green
    &[data-status="failed"] dd
      color uber-orange
  pre
    max-height 18vh

  aside.actions
    float right
    display flex
    flex-direction row
    a.terminate
      action-button(uber-orange)
      margin-right 5px
    a.signal
      action-button(uber-blue)
      margin-right 5px
    a.restart
      action-button(uber-green)

[data-modal="confirm-termination"]
  input
    margin layout-spacing-small 0
    width 50vw
  footer
    display flex
    justify-content space-between
  a.terminate
    action-button(uber-orange)
  a.cancel
    action-button()

[data-modal="send-signal"]
  div.checkbox
    margin layout-spacing-small 0
  input
    margin layout-spacing-small 0
    width 50vw
  footer
    display flex
    justify-content space-between
  a.send-signal
    action-button(uber-green)
  a.cancel
    action-button()

[data-modal="confirm-restart"]
  div.checkbox
    margin layout-spacing-small 0
  p
    margin layout-spacing-small 0
    width 50vw
  footer
    display flex
    justify-content space-between
  a.restart
    action-button(uber-orange)
  a.cancel
    action-button()

</style>
